import { getCopy, getKnowledge, recordSummary, recordTitle, recordVerification } from "@/modules/content";
import { copyText } from "@/components/copy";
import { KnowledgeCard } from "@/components/ContentCards";
import { CatalogueTools, EmptyCollection, matchesQuery, queryValue } from "@/components/CatalogueTools";

export async function generateMetadata() { return { title: copyText(getCopy(), "nav.library") }; }

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const copy = getCopy();
  const query = queryValue(params.q);
  const verification = queryValue(params.verification);
  const category = queryValue(params.category);
  const all = getKnowledge();
  const categories = [...new Set(all.map((record) => record.kind === "knowledge" ? record.data.category : "restricted"))].sort();
  const records = all.filter((record) => (!verification || recordVerification(record) === verification) && (!category || (record.kind === "knowledge" ? record.data.category : "restricted") === category) && matchesQuery(query, `${recordTitle(record).map((title) => title.text).join(" ")} ${recordSummary(record)} ${record.kind === "knowledge" ? record.data.tags?.join(" ") ?? "" : ""}`));
  return <div className="container catalogue-page"><header className="page-heading"><p className="eyebrow">{copyText(copy, "library.eyebrow")}</p><h1>{copyText(copy, "library.title")}</h1><p>{copyText(copy, "library.description")}</p></header><CatalogueTools copy={copy} action="/library" query={query} verification={verification} category={category} categories={categories} /><p className="result-count">{copyText(copy, "common.resultCount", { count: records.length })}</p>{records.length ? <div className="two-column-grid">{records.map((record) => <KnowledgeCard key={record.kind === "restricted" ? record.id : record.data.id} record={record} copy={copy} />)}</div> : <EmptyCollection copy={copy} href="/library" />}</div>;
}
