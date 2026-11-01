import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../../app/api/chat/route";
import { GET } from "../../app/api/search/route";
import { getIndex } from "../../modules/content";
import rawSource from "../../data/generated/index.json";
import type { GeneratedIndex, IndexedChunk } from "../../shared/types/generated";

const origin = "https://omhepo.example";
const index = getIndex();
const knownRecord = index.records.find((record) => record.kind === "clan" && record.data.id === "aakwanambwa");
assert.ok(knownRecord && knownRecord.kind === "clan");
const knownName = knownRecord.data.names[0].text;

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${origin}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function assertNoStore(response: Response): void {
  assert.match(response.headers.get("cache-control") ?? "", /(?:^|[,\s])no-store(?:$|[,\s])/);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
}

async function withProviderConfig<T>(configured: boolean, action: () => Promise<T>): Promise<T> {
  const keys = ["LLM_BASE_URL", "LLM_MODEL", "LLM_API_KEY"] as const;
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  if (configured) {
    process.env.LLM_BASE_URL = "https://provider.invalid/v1";
    process.env.LLM_MODEL = "test-only";
  }
  try { return await action(); }
  finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

test("chat API returns a grounded default answer with no-store JSON", async () => {
  const response = await withProviderConfig(false, () => POST(request({ message: `What is ${knownName}?` })));
  assert.equal(response.status, 200);
  assertNoStore(response);
  const body = await response.json();
  assert.equal(body.grounded, true);
  assert.equal(body.mode, "simulated");
  assert.ok(body.citations.some((citation: { entryId: string }) => citation.entryId === knownRecord.data.id));
});

test("chat API refuses medical and ritual requests before contacting a configured provider", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; throw new Error("External request forbidden in API tests"); });
  for (const query of [
    { message: "What dose treats fever?", intent: "medical" },
    { message: "How do I do rites of the life cycle?", intent: "ritual-howto" },
  ]) {
    const response = await withProviderConfig(true, () => POST(request({ message: query.message })));
    assert.equal(response.status, 200);
    assertNoStore(response);
    const body = await response.json();
    assert.equal(body.intent, query.intent);
    assert.equal(body.grounded, false);
    assert.equal(body.mode, "refusal");
    assert.equal(body.excerpts.length, 0);
  }
  assert.equal(calls, 0);
});

test("chat API rejects client identity, history, chunks, and provider URL fields", async () => {
  for (const extra of [
    { identity: { displayName: "test" } },
    { history: [] },
    { messages: [] },
    { chunks: [] },
    { LLM_BASE_URL: "https://provider.invalid/v1" },
    { providerUrl: "https://provider.invalid/v1" },
  ]) {
    const response = await POST(request({ message: knownName, ...extra }));
    assert.equal(response.status, 400);
    assertNoStore(response);
  }
});

test("chat API rejects blank, absent, nonstring, and overlong messages", async () => {
  for (const body of [{ message: "  \n\t" }, {}, { message: null }, { message: 4 }, { message: "x".repeat(2001) }, []]) {
    const response = await POST(request(body));
    assert.equal(response.status, 400);
    assertNoStore(response);
  }
});

test("chat API rejects invalid JSON and missing or wrong content types", async () => {
  const cases: { body: string; headers: Record<string, string>; status: number }[] = [
    { body: "{", headers: { "content-type": "application/json" }, status: 400 },
    { body: JSON.stringify({ message: knownName }), headers: { "content-type": "text/plain" }, status: 415 },
    { body: JSON.stringify({ message: knownName }), headers: {}, status: 415 },
  ];
  for (const example of cases) {
    const response = await POST(new Request(`${origin}/api/chat`, { method: "POST", body: example.body, headers: example.headers }));
    assert.equal(response.status, example.status);
    assertNoStore(response);
  }
});

test("chat API rejects declared and actual request bodies over the byte limit", async () => {
  const declared = await POST(request({ message: knownName }, { "content-length": "16385" }));
  assert.equal(declared.status, 413);
  assertNoStore(declared);

  let cancelled = false;
  const encoded = new TextEncoder().encode(JSON.stringify({ message: "x".repeat(17_000) }));
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoded.subarray(0, 8000));
      controller.enqueue(encoded.subarray(8000));
    },
    cancel() { cancelled = true; },
  });
  const init: RequestInit & { duplex: "half" } = {
    method: "POST", headers: { "content-type": "application/json" }, body: stream, duplex: "half",
  };
  const actual = await POST(new Request(`${origin}/api/chat`, init));
  assert.equal(actual.status, 413);
  assertNoStore(actual);
  assert.equal(cancelled, true);
});

test("chat API rejects cross-site and foreign-Origin requests, while allowing the same origin", async () => {
  const cases: Record<string, string>[] = [
    { "sec-fetch-site": "cross-site" },
    { origin: "https://foreign.example" },
    { origin: "null" },
  ];
  for (const headers of cases) {
    const response = await POST(request({ message: knownName }, headers));
    assert.equal(response.status, 403);
    assertNoStore(response);
  }
  const response = await withProviderConfig(false, () => POST(request({ message: knownName }, { origin })));
  assert.equal(response.status, 200);
  assertNoStore(response);
});

test("search API returns only public references and never restricted summaries", async () => {
  const response = await GET(new Request(`${origin}/api/search?q=${encodeURIComponent(knownName)}`));
  assert.equal(response.status, 200);
  assertNoStore(response);
  const body = await response.json();
  assert.ok(body.results.length > 0);
  const publicIds = new Set(index.records.flatMap((record) => record.kind === "restricted" ? [] : [record.data.id]));
  assert.ok(body.results.every((result: { entryId: string }) => publicIds.has(result.entryId)));

  const restricted = index.records.find((record) => record.kind === "restricted");
  assert.ok(restricted && restricted.kind === "restricted");
  const restrictedResponse = await GET(new Request(`${origin}/api/search?q=${encodeURIComponent(restricted.id)}`));
  assert.equal(restrictedResponse.status, 200);
  const restrictedBody = await restrictedResponse.json();
  assert.ok(!restrictedBody.results.some((result: { entryId: string }) => result.entryId === restricted.id));
});

test("search API excludes private and community records even if a generated index is corrupted", async () => {
  const raw = rawSource as unknown as GeneratedIndex;
  const originalRecords = raw.records.length;
  const originalChunks = raw.chunks.length;
  try {
    for (const tier of ["private", "community"]) {
      const document = structuredClone(knownRecord);
      const id = `test-api-${tier}`;
      Reflect.set(document.data, "accessTier", tier);
      document.data.id = id;
      raw.records.push(document);
      const chunk: IndexedChunk | undefined = structuredClone(index.chunks.find((item) => item.entryId === knownRecord.data.id));
      assert.ok(chunk);
      chunk.entryId = id;
      chunk.chunkId = `${id}:0001`;
      raw.chunks.push(chunk);
    }
    const response = await GET(new Request(`${origin}/api/search?q=${encodeURIComponent(knownName)}`));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.ok(body.results.every((result: { entryId: string }) => !result.entryId.startsWith("test-api-")));
  } finally {
    raw.records.splice(originalRecords);
    raw.chunks.splice(originalChunks);
  }
});

test("search API rejects empty and oversized queries with no-store JSON", async () => {
  for (const query of ["", "   ", "x".repeat(201)]) {
    const response = await GET(new Request(`${origin}/api/search?q=${encodeURIComponent(query)}`));
    assert.equal(response.status, 400);
    assertNoStore(response);
  }
});
