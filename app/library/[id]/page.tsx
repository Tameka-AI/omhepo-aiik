import Link from "next/link";
import { notFound } from "next/navigation";
import { getCopy, getKnowledge, getRecord, recordId, recordTitle } from "@/modules/content";
import { copyText } from "@/components/copy";
import { RecordHeader, ProvenancePanel, RelatedReading, SpellingNotes } from "@/components/RecordParts";
import { RestrictedNotice } from "@/components/governance";
import { Markdown } from "@/components/Markdown";

export function generateStaticParams() { return getKnowledge().map((record) => ({ id: recordId(record) })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  return record ? { title: recordTitle(record)[0].text } : {};
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const record = getRecord((await params).id);
  if (!record || (record.kind !== "knowledge" && !(record.kind === "restricted" && record.sourceKind === "knowledge"))) notFound();
  const copy = getCopy();
  if (record.kind === "restricted") return <article className="container detail-page"><Link className="back-link" href="/library"><span aria-hidden="true">←</span>{copyText(copy, "common.backLibrary")}</Link><RecordHeader record={record} copy={copy} eyebrow={copyText(copy, "category.restricted")} /><div className="detail-columns"><div className="detail-main"><p className="article-lead">{record.summary}</p><RestrictedNotice note={record.governanceNote} copy={copy} /></div><aside className="detail-sidebar"><ProvenancePanel record={record} copy={copy} /></aside></div></article>;
  const { data } = record;
  const isProverb = data.category === "proverb";
  return <article className="container detail-page"><Link className="back-link" href="/library"><span aria-hidden="true">←</span>{copyText(copy, "common.backLibrary")}</Link><RecordHeader record={record} copy={copy} eyebrow={copyText(copy, `category.${data.category}`)} hideSecondary={isProverb} /><div className="detail-columns"><div className="detail-main">{isProverb ? <div className="proverb-reading">{!!data.literalTranslation?.length && <section><p className="eyebrow">{copyText(copy, "library.literal")}</p>{data.literalTranslation.map((text, index) => <blockquote lang={text.lang} key={`${text.lang}-${index}`}>{text.text}</blockquote>)}</section>}<section><p className="eyebrow">{copyText(copy, "library.meaning")}</p><p className="article-lead">{data.summary}</p></section></div> : <p className="article-lead">{data.summary}</p>}<section className="record-section">{isProverb && <h2>{copyText(copy, "library.context")}</h2>}{data.body?.length ? data.body.map((body, index) => <div lang={body.lang} key={`${body.lang}-${index}`}><Markdown>{body.text}</Markdown></div>) : <Markdown omitTitle>{record.markdown}</Markdown>}</section><p className="muted-note translation-note">{copyText(copy, "common.englishBody")}</p><SpellingNotes text={[...data.title, ...data.literalTranslation ?? []]} copy={copy} />{data.governanceNote && <aside className="governance-note"><h2>{copyText(copy, "common.governanceNote")}</h2><p>{data.governanceNote}</p></aside>}{!!data.tags?.length && <div className="tag-row">{data.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>}<RelatedReading ids={[...data.clanIds ?? [], ...data.relatedIds ?? [], ...data.glossaryIds ?? []]} copy={copy} /></div><aside className="detail-sidebar"><ProvenancePanel record={record} copy={copy} /></aside></div></article>;
}
