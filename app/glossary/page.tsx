import { getCopy, getGlossary } from "@/modules/content";
import { copyText } from "@/components/copy";
import { CatalogueTools, EmptyCollection, matchesQuery, queryValue } from "@/components/CatalogueTools";
import { CrossCulturalBadge, ScopeLine, SourceBadge, VerificationBadge } from "@/components/governance";

export async function generateMetadata() { return { title: copyText(getCopy(), "nav.glossary") }; }

export default async function GlossaryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const copy = getCopy();
  const query = queryValue(params.q);
  const verification = queryValue(params.verification);
  const records = getGlossary().filter(({ data }) => (!verification || data.verification === verification) && matchesQuery(query, `${data.term.map((term) => term.text).join(" ")} ${data.gloss}`));
  return <div className="container catalogue-page glossary-page"><header className="page-heading"><p className="eyebrow">{copyText(copy, "glossary.eyebrow")}</p><h1>{copyText(copy, "glossary.title")}</h1><p>{copyText(copy, "glossary.description")}</p></header><CatalogueTools copy={copy} action="/glossary" query={query} verification={verification} searchLabel={copyText(copy, "glossary.searchLabel")} placeholder={copyText(copy, "glossary.searchPlaceholder")} /><p className="result-count">{copyText(copy, "common.resultCount", { count: records.length })}</p>{records.length ? <div className="glossary-list">{records.map(({ data }) => <article id={data.id} key={data.id} className="glossary-entry"><div className="glossary-term"><h2 lang={data.term[0].lang}>{data.term[0].text}</h2>{data.term.slice(1).map((term, index) => <p key={`${term.text}-${index}`}><span lang={term.lang}>{term.text}</span>{term.orthographyNote && <span className="glossary-form-note">{term.orthographyNote}</span>}</p>)}</div><div className="glossary-definition"><VerificationBadge status={data.verification} copy={copy} /><p className="gloss-text">{data.gloss}</p><ScopeLine scope={data.scope} copy={copy} /><CrossCulturalBadge scope={data.scope} copy={copy} /><SourceBadge provenance={data.provenance} copy={copy} /></div></article>)}</div> : <EmptyCollection copy={copy} href="/glossary" />}</div>;
}
