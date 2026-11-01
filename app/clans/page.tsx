import { getClans, getCopy } from "@/modules/content";
import { copyText } from "@/components/copy";
import { ClanCard } from "@/components/ContentCards";
import { CatalogueTools, EmptyCollection, matchesQuery, queryValue } from "@/components/CatalogueTools";

export async function generateMetadata() { return { title: copyText(getCopy(), "clans.title") }; }

export default async function ClansPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const copy = getCopy();
  const query = queryValue(params.q);
  const verification = queryValue(params.verification);
  const clans = getClans().filter(({ data }) => (!verification || data.verification === verification) && matchesQuery(query, [data.names.map((name) => name.text).join(" "), data.emblem.name.map((name) => name.text).join(" "), data.description].join(" ")));
  return <div className="container catalogue-page"><header className="page-heading"><p className="eyebrow">{copyText(copy, "clans.eyebrow")}</p><h1>{copyText(copy, "clans.title")}<span className="heading-subtitle">{copyText(copy, "clans.subtitle")}</span></h1><p>{copyText(copy, "clans.description")}</p></header><aside className="variant-notice">{copyText(copy, "clans.variantNote")}</aside><CatalogueTools copy={copy} action="/clans" query={query} verification={verification} searchLabel={copyText(copy, "clans.searchLabel")} placeholder={copyText(copy, "clans.searchPlaceholder")} /><p className="result-count">{copyText(copy, "common.resultCount", { count: clans.length })}</p>{clans.length ? <div className="two-column-grid">{clans.map((record) => <ClanCard key={record.data.id} record={record} copy={copy} />)}</div> : <EmptyCollection copy={copy} href="/clans" />}</div>;
}
