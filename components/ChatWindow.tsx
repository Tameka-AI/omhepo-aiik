"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import type { InterfaceCopy } from "@/shared/types/generated";
import type { GroundedChatResponse, SourceReference } from "@/shared/types/chat";
import { copyText } from "./copy";
import { ArrowIcon, ArchiveIcon } from "./Icons";
import { CrossCulturalBadge, ScopeLine, SourceBadge, VerificationBadge } from "./governance";
import { Markdown } from "./Markdown";

type Turn = { id: number; question: string; response: GroundedChatResponse };
const maxQuestionLength = 2000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReference(value: unknown): value is SourceReference {
  if (!isObject(value) || typeof value.entryId !== "string" || typeof value.title !== "string" || typeof value.attribution !== "string" || typeof value.href !== "string" || !/^\/(?:clans\/[a-z0-9-]+|library\/[a-z0-9-]+|glossary#[a-z0-9-]+)$/.test(value.href)) return false;
  if (!["draft", "owner-reviewed", "elder-verified", "disputed"].includes(String(value.verification)) || !["oral-elder", "family-notes", "personal-practice", "published", "community-contrib", "ai-synthesis"].includes(String(value.sourceType))) return false;
  if (value.scope !== undefined) {
    if (!isObject(value.scope) || !isObject(value.scope.origin) || typeof value.scope.origin.ethnicGroup !== "string" || !Array.isArray(value.scope.appliesTo) || !value.scope.appliesTo.every((item) => typeof item === "string")) return false;
    if (value.scope.origin.region !== undefined && typeof value.scope.origin.region !== "string") return false;
    if (value.scope.origin.lineage !== undefined && typeof value.scope.origin.lineage !== "string") return false;
  }
  return true;
}

function isResponse(value: unknown): value is GroundedChatResponse {
  return isObject(value) && typeof value.text === "string" && typeof value.grounded === "boolean"
    && ["knowledge", "ritual-howto", "medical", "lineage-personal", "smalltalk", "out-of-scope"].includes(String(value.intent))
    && ["simulated", "provider", "simulated-fallback", "refusal", "unavailable"].includes(String(value.mode))
    && Array.isArray(value.citations) && value.citations.every(isReference)
    && Array.isArray(value.redirects) && value.redirects.every(isReference)
    && Array.isArray(value.excerpts) && value.excerpts.every((excerpt) => isReference(excerpt) && isObject(excerpt) && typeof excerpt.quote === "string" && typeof excerpt.chunkId === "string")
    && (value.modeNotice === undefined || typeof value.modeNotice === "string")
    && (value.safetyNotice === undefined || typeof value.safetyNotice === "string");
}

function ChatSource({ reference, copy, number }: { reference: SourceReference; copy: InterfaceCopy; number?: number }) {
  return <article className="chat-source"><Link href={reference.href} className="chat-source-title">{number !== undefined && <span className="citation-number">{number}</span>}<span>{reference.title}</span><ArrowIcon diagonal /></Link><div className="chat-source-badges"><VerificationBadge status={reference.verification} copy={copy} /><SourceBadge provenance={reference} copy={copy} /></div><ScopeLine scope={reference.scope} copy={copy} /><CrossCulturalBadge scope={reference.scope} copy={copy} /></article>;
}

function Answer({ response, copy }: { response: GroundedChatResponse; copy: InterfaceCopy }) {
  return <div className={`chat-answer ${response.mode === "refusal" ? "chat-answer-boundary" : ""}`}><div className="chat-answer-heading"><span className="chat-speaker">{copyText(copy, "chat.assistant")}</span><span className={`answer-state${response.grounded ? " answer-grounded" : ""}`}>{copyText(copy, response.grounded ? "chat.grounded" : response.mode === "refusal" ? "chat.boundary" : "chat.notGrounded")}</span></div>{response.grounded ? <>{response.modeNotice && <p className="chat-mode-notice">{response.modeNotice}</p>}<div className="chat-excerpts">{response.excerpts.map((excerpt, index) => <figure className="chat-excerpt" key={excerpt.chunkId}><figcaption>{copyText(copy, "chat.excerpt", { number: index + 1 })}</figcaption><blockquote><Markdown>{excerpt.quote}</Markdown></blockquote></figure>)}</div><div className="chat-citations"><h3>{copyText(copy, "chat.sources")}</h3>{response.citations.map((reference, index) => <ChatSource key={reference.entryId} reference={reference} copy={copy} number={index + 1} />)}</div></> : <><Markdown>{response.text}</Markdown>{response.safetyNotice && <p className="chat-safety-notice">{response.safetyNotice}</p>}{response.redirects.length > 0 && <div className="chat-redirects"><h3>{copyText(copy, "chat.safeReading")}</h3>{response.redirects.map((reference) => <ChatSource key={reference.entryId} reference={reference} copy={copy} />)}</div>}</>}</div>;
}

export function ChatWindow({ copy }: { copy: InterfaceCopy }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const pending = pendingQuestion !== null;
  const suggestions = ["chat.suggestion1", "chat.suggestion2", "chat.suggestion3"];

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (log.current && (turns.length || pending)) log.current.scrollTop = log.current.scrollHeight;
  }, [turns.length, pending]);

  async function ask(message: string) {
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > maxQuestionLength || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPendingQuestion(trimmed);
    setQuestion(trimmed);
    setError(null);
    const timeout = window.setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        setError(isObject(payload) && typeof payload.error === "string" ? payload.error : copyText(copy, "chat.error"));
        return;
      }
      if (!isResponse(payload)) {
        setError(copyText(copy, "chat.invalidResponse"));
        return;
      }
      const id = nextId.current++;
      setTurns((previous) => [...previous, { id, question: trimmed, response: payload }]);
      setQuestion("");
    } catch {
      setError(copyText(copy, "chat.error"));
    } finally {
      window.clearTimeout(timeout);
      request.current = null;
      setPendingQuestion(null);
      field.current?.focus();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void ask(question);
    }
  }

  return <div className="chat-window"><header className="chat-window-header"><div className="chat-avatar"><ArchiveIcon /></div><div><h3>{copyText(copy, "chat.title")}</h3><p>{copyText(copy, "chat.subtitle")}</p></div><span className="chat-mode-pill">{copyText(copy, "chat.modeLabel")}</span></header><div className="chat-log" ref={log} role="log" aria-live="polite" aria-relevant="additions" aria-busy={pending}>
    {!turns.length && !pending && <div className="chat-empty"><span className="chat-empty-symbol" aria-hidden="true">↗</span><h3>{copyText(copy, "chat.emptyTitle")}</h3><p>{copyText(copy, "chat.emptyDescription")}</p><div className="chat-suggestions">{suggestions.map((key) => <button type="button" key={key} onClick={() => void ask(copyText(copy, key))}>{copyText(copy, key)}<ArrowIcon /></button>)}</div></div>}
    {turns.map((turn) => <div className="chat-turn" key={turn.id}><div className="chat-question"><span className="chat-speaker">{copyText(copy, "chat.you")}</span><p>{turn.question}</p></div><Answer response={turn.response} copy={copy} /></div>)}
    {pending && <div className="chat-turn"><div className="chat-question"><span className="chat-speaker">{copyText(copy, "chat.you")}</span><p>{pendingQuestion}</p></div><div className="chat-loading" role="status"><span className="loading-dot" /><span>{copyText(copy, "chat.sending")}</span></div></div>}
  </div><form className="chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="chat-question">{copyText(copy, "chat.questionLabel")}</label><div className="composer-field"><textarea ref={field} id="chat-question" rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={onKeyDown} disabled={pending} maxLength={maxQuestionLength} placeholder={copyText(copy, "chat.placeholder")} aria-describedby="chat-input-hint" /><button className="button button-primary" type="submit" disabled={pending || !question.trim()} aria-label={copyText(copy, pending ? "chat.sending" : "chat.send")}><span>{copyText(copy, "chat.send")}</span><ArrowIcon /></button></div><div className="composer-meta"><p id="chat-input-hint">{copyText(copy, "chat.keyboardHint")}</p>{question.length > 1800 && <span>{copyText(copy, "chat.characterCount", { count: question.length, limit: maxQuestionLength })}</span>}</div>{error && <p className="form-error" role="alert">{error}</p>}<p className="composer-privacy">{copyText(copy, "chat.composerNote")}</p></form>{turns.length > 0 && <div className="chat-clear-row"><button type="button" disabled={pending} onClick={() => { setTurns([]); setError(null); field.current?.focus(); }}>{copyText(copy, "chat.clear")}</button><p>{copyText(copy, "chat.clearNote")}</p></div>}</div>;
}
