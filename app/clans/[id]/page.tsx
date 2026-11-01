import Link from "next/link";
import { notFound } from "next/navigation";
import { getClans, getCopy, getRecord } from "@/modules/content";
import { copyText } from "@/components/copy";
import { RecordHeader, ProvenancePanel, RelatedReading } from "@/components/RecordParts";
import { Markdown } from "@/components/Markdown";

export function generateStaticParams() { return getClans().map((record) => ({ id: record.data.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  return record?.kind === "clan" ? { title: record.data.names[0].text } : {};
}

export default async function ClanPage({ params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record || record.kind !== "clan" || record.data.accessTier !== "public") notFound();
  const copy = getCopy();
  const { data } = record;
  return <article className="container detail-page"><Link className="back-link" href="/clans"><span aria-hidden="true">←</span>{copyText(copy, "common.backClans")}</Link><RecordHeader record={record} copy={copy} eyebrow={copyText(copy, "clans.profileLabel")} /><div className="detail-columns"><div className="detail-main"><section className="record-section"><h2>{copyText(copy, "clans.descriptionTitle")}</h2><p className="article-lead">{data.description}</p><div className="clan-facts"><div><span className="eyebrow">{copyText(copy, "clans.emblem")}</span><strong>{data.emblem.name.map((item) => item.text).join(" · ")}</strong><span>{copyText(copy, `emblem.${data.emblem.kind}`)}</span></div><div><span className="eyebrow">{copyText(copy, "clans.descent")}</span><strong>{copyText(copy, `clans.descent.${data.descent}`)}</strong></div></div></section><section className="record-section"><h2>{copyText(copy, "clans.names")}</h2><ul className="names-list">{data.names.map((name, index) => <li key={`${name.text}-${index}`}><strong lang={name.lang}>{name.text}</strong><span>{name.dialect && name.dialect !== "unknown" ? name.dialect : copyText(copy, "common.dialectUnknown")}</span>{name.orthographyNote && <p>{name.orthographyNote}</p>}</li>)}</ul><p className="muted-note">{copyText(copy, "clans.variantNote")}</p></section><section className="record-section"><h2>{copyText(copy, "clans.symbolism")}</h2>{data.emblem.symbolism.length ? <div className="tag-row">{data.emblem.symbolism.map((symbol) => <span className="tag" key={symbol}>{symbol}</span>)}</div> : <p className="muted-note">{copyText(copy, "clans.noSymbolism")}</p>}</section>{data.dailyIntegration.length > 0 && <section className="practice-panel"><p className="eyebrow">{copyText(copy, "source.personal-practice")}</p><h2>{copyText(copy, "clans.practice")}</h2><p className="muted-note">{copyText(copy, "clans.practiceNote")}</p><ul>{data.dailyIntegration.map((practice) => <li key={practice}>{practice}</li>)}</ul></section>}{!!data.emblem.observances?.length && <section className="record-section"><h2>{copyText(copy, "clans.observances")}</h2><ul>{data.emblem.observances.map((observance) => <li key={observance}>{observance}</li>)}</ul></section>}{data.note && <aside className="governance-note"><h2>{copyText(copy, "clans.note")}</h2><p>{data.note}</p></aside>}{record.markdown && <section className="record-section"><h2>{copyText(copy, "clans.sourceText")}</h2><Markdown omitTitle>{record.markdown}</Markdown></section>}<RelatedReading ids={data.relatedKnowledgeIds} copy={copy} /></div><aside className="detail-sidebar"><ProvenancePanel record={record} copy={copy} /></aside></div></article>;
}
