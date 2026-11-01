import Link from "next/link";
import type { ContentRecord, InterfaceCopy, PublicRecord } from "@/shared/types/generated";
import { recordHref, recordProvenance, recordScope, recordSummary, recordTitle, recordVerification } from "@/modules/content";
import { copyText } from "./copy";
import { ArrowIcon } from "./Icons";
import { CrossCulturalBadge, ScopeLine, SourceBadge, VerificationBadge } from "./governance";

export function ClanCard({ record, copy, featured = false }: { record: Extract<PublicRecord, { kind: "clan" }>; copy: InterfaceCopy; featured?: boolean }) {
  const { data } = record;
  return <article className={`clan-card${featured ? " clan-card-featured" : ""}`}>
    <div className="card-top"><span className="eyebrow">{copyText(copy, "category.clan")}</span><VerificationBadge status={data.verification} copy={copy} /></div>
    <h2><Link href={recordHref(record)}>{data.names[0].text}</Link></h2>
    <p className="name-variants">{data.names.slice(1).map((name) => name.text).join(" · ")}</p>
    <div className="emblem-line"><span>{copyText(copy, "clans.emblem")}</span><strong>{data.emblem.name.map((name) => name.text).join(" · ")}</strong><span className="emblem-kind">{copyText(copy, `emblem.${data.emblem.kind}`)}</span></div>
    <p className="card-description">{data.description}</p>
    <ScopeLine scope={data.scope} copy={copy} />
    <CrossCulturalBadge scope={data.scope} copy={copy} />
    <div className="card-bottom"><SourceBadge provenance={data.provenance} copy={copy} /><Link className="icon-link" href={recordHref(record)} aria-label={`${copyText(copy, "common.viewProfile")}: ${data.names.map((name) => name.text).join(" · ")}`}><ArrowIcon /></Link></div>
  </article>;
}

export function KnowledgeCard({ record, copy }: { record: ContentRecord; copy: InterfaceCopy }) {
  const titles = recordTitle(record);
  const secondary = titles.slice(1).map((title) => title.text).join(" · ");
  const category = record.kind === "knowledge" ? record.data.category : record.kind === "restricted" ? "restricted" : record.kind;
  return <article className={`knowledge-card${record.kind === "restricted" ? " knowledge-card-restricted" : ""}`}>
    <div className="card-top"><span className="eyebrow">{copyText(copy, `category.${category}`)}</span><VerificationBadge status={recordVerification(record)} copy={copy} /></div>
    <h2><Link href={recordHref(record)} lang={titles[0]?.lang}>{titles[0]?.text}</Link></h2>
    {secondary && <p className="secondary-title">{secondary}</p>}
    <p className="card-description">{recordSummary(record)}</p>
    {record.kind === "restricted" && <span className="badge tier-restricted">{copyText(copy, "access.restricted")}</span>}
    <ScopeLine scope={recordScope(record)} copy={copy} />
    <CrossCulturalBadge scope={recordScope(record)} copy={copy} />
    <div className="card-bottom"><SourceBadge provenance={recordProvenance(record)} copy={copy} /><Link href={recordHref(record)} className="icon-link" aria-label={`${copyText(copy, "common.readEntry")}: ${titles[0]?.text}`}><ArrowIcon /></Link></div>
  </article>;
}
