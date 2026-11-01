import Link from "next/link";
import type { InterfaceCopy } from "@/shared/types/generated";
import { copyText } from "./copy";
import { SearchIcon } from "./Icons";

export const verificationOptions = ["draft", "owner-reviewed", "elder-verified", "disputed"] as const;

export function CatalogueTools({ copy, action, query, verification = "", category, categories, searchLabel, placeholder }: {
  copy: InterfaceCopy; action: string; query: string; verification?: string; category?: string; categories?: string[]; searchLabel?: string; placeholder?: string;
}) {
  return <form className="catalogue-tools" action={action} method="get"><div className="filter-search"><label htmlFor="collection-search">{searchLabel ?? copyText(copy, "common.searchLabel")}</label><div className="search-field"><SearchIcon /><input id="collection-search" name="q" type="search" defaultValue={query} placeholder={placeholder ?? copyText(copy, "common.searchPlaceholder")} maxLength={200} /></div></div>{categories && <div className="filter-select"><label htmlFor="category-filter">{copyText(copy, "common.categoryLabel")}</label><select id="category-filter" name="category" defaultValue={category}><option value="">{copyText(copy, "common.allCategories")}</option>{categories.map((value) => <option key={value} value={value}>{copyText(copy, `category.${value}`)}</option>)}</select></div>}<div className="filter-select"><label htmlFor="review-filter">{copyText(copy, "common.reviewLabel")}</label><select id="review-filter" name="verification" defaultValue={verification}><option value="">{copyText(copy, "verification.all")}</option>{verificationOptions.map((value) => <option key={value} value={value}>{copyText(copy, `verification.${value}`)}</option>)}</select></div><button className="button button-secondary" type="submit">{copyText(copy, "common.apply")}</button>{(query || verification || category) && <Link className="filter-clear" href={action}>{copyText(copy, "common.clear")}</Link>}</form>;
}

export function EmptyCollection({ copy, href }: { copy: InterfaceCopy; href: string }) {
  return <div className="empty-collection"><h2>{copyText(copy, "common.noResults")}</h2><p>{copyText(copy, "common.noResultsHelp")}</p><Link className="text-link" href={href}>{copyText(copy, "common.clear")}</Link></div>;
}

export function queryValue(value: string | string[] | undefined): string {
  return (typeof value === "string" ? value : "").trim().slice(0, 200);
}

export function matchesQuery(query: string, text: string): boolean {
  const normalise = (value: string) => value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return normalise(query).split(/\s+/).filter(Boolean).every((word) => normalise(text).includes(word));
}
