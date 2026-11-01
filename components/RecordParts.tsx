import Link from "next/link";
import type { ContentRecord, InterfaceCopy } from "@/shared/types/generated";
import type { LocalizedText } from "@/shared/types";
import { getRecord, recordHref, recordProvenance, recordScope, recordTitle, recordVerification } from "@/modules/content";
import { copyText, publicUrl } from "./copy";
import { ArrowIcon } from "./Icons";
import { CrossCulturalBadge, ScopeLine, SourceBadge, VerificationBadge } from "./governance";

export function RecordHeader({ record, copy, eyebrow, hideSecondary = false }: { record: ContentRecord; copy: InterfaceCopy; eyebrow: string; hideSecondary?: boolean }) {
  const titles = recordTitle(record);
  return <header className="record-header"><p className="eyebrow">{eyebrow}</p><h1 lang={titles[0]?.lang}>{titles[0]?.text}</h1>{!hideSecondary && titles.length > 1 && <p className="record-secondary">{titles.slice(1).map((title) => title.text).join(" · ")}</p>}<div className="record-badges"><VerificationBadge status={recordVerification(record)} copy={copy} /><span className={`badge tier-${record.kind === "restricted" ? "restricted" : "public"}`}>{copyText(copy, record.kind === "restricted" ? "access.restricted" : "access.public")}</span></div><ScopeLine scope={recordScope(record)} copy={copy} /><CrossCulturalBadge scope={recordScope(record)} copy={copy} /></header>;
}

export function ProvenancePanel({ record, copy }: { record: ContentRecord; copy: InterfaceCopy }) {
  const provenance = recordProvenance(record);
  const citations = "citations" in provenance ? provenance.citations ?? [] : [];
  return <section className="provenance-panel" aria-labelledby="provenance-title"><p className="eyebrow">{copyText(copy, "source.attribution")}</p><h2 id="provenance-title">{copyText(copy, "common.attributionTitle")}</h2><div className="record-badges"><VerificationBadge status={recordVerification(record)} copy={copy} /><SourceBadge provenance={provenance} copy={copy} /></div><p className="attribution-text">{provenance.attribution}</p><ScopeLine scope={recordScope(record)} copy={copy} /><dl className="provenance-facts">{"contributor" in provenance && provenance.contributor && <><dt>{copyText(copy, "source.contributor")}</dt><dd>{provenance.contributor}</dd></>}{"reviewedBy" in provenance && !!provenance.reviewedBy?.length && <><dt>{copyText(copy, "source.reviewedBy")}</dt><dd>{provenance.reviewedBy.join(", ")}</dd></>}{"collectedAt" in provenance && provenance.collectedAt && <><dt>{copyText(copy, "source.collectedAt")}</dt><dd><time dateTime={provenance.collectedAt}>{provenance.collectedAt}</time></dd></>}{"consent" in provenance && <><dt>{copyText(copy, "source.consent")}</dt><dd>{copyText(copy, `source.consent.${provenance.consent}`)}</dd></>}{record.kind === "knowledge" && <><dt>{copyText(copy, "source.updatedAt")}</dt><dd><time dateTime={record.data.updatedAt}>{record.data.updatedAt}</time></dd></>}</dl>{citations.length > 0 && <div className="source-links"><h3>{copyText(copy, "source.citations")}</h3><ul>{citations.map((citation, index) => { const href = publicUrl(citation); return <li key={citation}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{copyText(copy, "source.reference", { number: index + 1 })}<ArrowIcon diagonal /></a> : citation}</li>; })}</ul></div>}</section>;
}

export function RelatedReading({ ids, copy }: { ids: string[]; copy: InterfaceCopy }) {
  const records = [...new Set(ids)].map(getRecord).filter((record): record is ContentRecord => !!record);
  if (!records.length) return null;
  return <section className="related-reading"><h2>{copyText(copy, "common.related")}</h2><div>{records.map((record) => <Link key={recordHref(record)} href={recordHref(record)}><span>{recordTitle(record)[0].text}</span><ArrowIcon /></Link>)}</div></section>;
}

export function SpellingNotes({ text, copy }: { text: LocalizedText[]; copy: InterfaceCopy }) {
  const withNotes = text.filter((value) => value.orthographyNote || value.dialect);
  if (!withNotes.length) return null;
  return <details className="spelling-notes"><summary>{copyText(copy, "common.orthography")}</summary>{withNotes.map((value, index) => <div key={`${value.text}-${index}`}><strong lang={value.lang}>{value.text}</strong>{value.orthographyNote && <p>{value.orthographyNote}</p>}{value.dialect && <p>{copyText(copy, "common.dialect")}: {value.dialect === "unknown" ? copyText(copy, "common.dialectUnknown") : value.dialect}</p>}</div>)}</details>;
}
