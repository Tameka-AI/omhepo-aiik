import Link from "next/link";
import { getCopy } from "@/modules/content";
import { copyText } from "@/components/copy";
import { ArrowIcon } from "@/components/Icons";

export default function NotFoundPage() {
  const copy = getCopy();
  return <section className="container missing-page"><p className="eyebrow">{copyText(copy, "missing.eyebrow")}</p><h1>{copyText(copy, "missing.title")}</h1><p>{copyText(copy, "missing.description")}</p><Link className="button button-primary" href="/library">{copyText(copy, "missing.action")}<ArrowIcon /></Link></section>;
}
