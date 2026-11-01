import Link from "next/link";
import { getCopy } from "@/modules/content";
import { copyText } from "@/components/copy";
import { LockIcon, ThreadMark } from "@/components/Icons";
import { VerificationBadge } from "@/components/governance";
import { verificationOptions } from "@/components/CatalogueTools";

export async function generateMetadata() { return { title: copyText(getCopy(), "nav.about") }; }

export default function AboutPage() {
  const copy = getCopy();
  return <div className="container about-page"><header className="page-heading about-heading"><ThreadMark /><p className="eyebrow">{copyText(copy, "about.eyebrow")}</p><h1>{copyText(copy, "about.title")}</h1><p>{copyText(copy, "about.intro")}</p></header><section className="about-section"><h2>{copyText(copy, "about.methodTitle")}</h2><div className="about-methods">{["source", "review", "answers"].map((key, index) => <article key={key}><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><h3>{copyText(copy, `about.${key}Title`)}</h3><p>{copyText(copy, `about.${key}Text`)}</p></article>)}</div></section><section className="about-section"><div className="section-heading"><div><h2>{copyText(copy, "about.accessTitle")}</h2><p>{copyText(copy, "about.accessIntro")}</p></div></div><div className="access-grid">{["public", "community", "restricted", "private"].map((tier) => <article key={tier}><span className={`badge tier-${tier}`}>{copyText(copy, `access.${tier}`)}</span><p>{copyText(copy, `about.access.${tier}`)}</p></article>)}</div></section><section className="about-section review-guide"><h2>{copyText(copy, "about.reviewStatuses")}</h2>{verificationOptions.map((status) => <div key={status}><VerificationBadge status={status} copy={copy} /><p>{copyText(copy, `about.review.${status}`)}</p></div>)}</section><section className="about-boundary"><LockIcon /><div><h2>{copyText(copy, "about.boundaryTitle")}</h2><p>{copyText(copy, "about.boundaryText")}</p></div></section><div className="about-bottom-grid"><section className="about-section"><h2>{copyText(copy, "about.correctionsTitle")}</h2><p>{copyText(copy, "about.correctionsText")}</p></section><section className="about-section"><h2>{copyText(copy, "about.localTitle")}</h2><p>{copyText(copy, "about.localText")}</p><Link className="text-link" href="/onboarding">{copyText(copy, "nav.identity")}</Link></section></div><p className="brand-explanation">{copyText(copy, "about.brandNote")}</p></div>;
}
