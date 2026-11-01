import { getCopy, getIndex, getPrompts, getRecord, recordSummary } from "@/modules/content";
import { parseIntentRules } from "@/modules/governance/refusals";
import { retrievePublic, sourceReference } from "@/modules/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 200) {
    return Response.json({ error: getCopy()["errors.invalidRequest"] }, {
      status: 400, headers: { "Cache-Control": "no-store" },
    });
  }
  const index = getIndex();
  const policy = parseIntentRules(getPrompts().intentRules);
  const results = retrievePublic(index, query, { policy, strict: false, limit: 30 }).flatMap((chunk) => {
    const record = getRecord(chunk.entryId);
    if (!record || record.kind === "restricted" || record.data.accessTier !== "public") return [];
    return [{ ...sourceReference(record), summary: recordSummary(record), score: chunk.score }];
  });
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
