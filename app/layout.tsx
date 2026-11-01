import type { Metadata } from "next";
import Link from "next/link";
import { getCopy } from "@/modules/content";
import { copyText } from "@/components/copy";
import { ArrowIcon, PersonIcon } from "@/components/Icons";
import "./globals.css";

export function generateMetadata(): Metadata {
  const copy = getCopy();
  return {
    title: { default: copyText(copy, "brand.full"), template: `%s · ${copyText(copy, "brand.full")}` },
    description: copyText(copy, "meta.description"),
    robots: { index: false, follow: false },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const copy = getCopy();
  const navigation = [["/clans", "nav.clans"], ["/library", "nav.library"], ["/glossary", "nav.glossary"], ["/about", "nav.about"]];
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">{copyText(copy, "nav.skip")}</a>
    <div className="prototype-banner"><div className="container"><p><span className="status-dot" aria-hidden="true" />{copyText(copy, "banner.text")}</p><Link href="/about">{copyText(copy, "banner.link")}<ArrowIcon /></Link></div></div>
    <header className="site-header"><div className="container header-inner"><Link href="/" className="brand" aria-label={copyText(copy, "brand.accessible")}><span className="brand-word">{copyText(copy, "brand.name")}</span><span className="brand-descriptor">{copyText(copy, "brand.descriptor")}</span></Link><nav className="desktop-navigation" aria-label={copyText(copy, "nav.primary")}>{navigation.map(([href, key]) => <Link key={href} href={href}>{copyText(copy, key)}</Link>)}</nav><div className="header-actions"><Link className="profile-link" href="/onboarding" aria-label={copyText(copy, "nav.identity")}><PersonIcon /></Link><Link className="button button-primary header-ask" href="/#ask">{copyText(copy, "nav.ask")}<ArrowIcon /></Link></div><details className="mobile-menu"><summary>{copyText(copy, "nav.menu")}<span aria-hidden="true">+</span></summary><nav aria-label={copyText(copy, "nav.mobile")}>{navigation.map(([href, key]) => <Link key={href} href={href}>{copyText(copy, key)}</Link>)}<Link href="/onboarding">{copyText(copy, "nav.identity")}</Link><Link href="/#ask">{copyText(copy, "nav.ask")}</Link></nav></details></div></header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="container"><div className="footer-main"><div><Link href="/" className="brand" aria-label={copyText(copy, "brand.accessible")}><span className="brand-word">{copyText(copy, "brand.name")}</span><span className="brand-descriptor">{copyText(copy, "brand.descriptor")}</span></Link><p className="footer-tagline">{copyText(copy, "footer.tagline")}</p><p className="footer-note">{copyText(copy, "footer.note")}</p></div><div className="footer-links"><Link href="/library">{copyText(copy, "nav.library")}</Link><Link href="/clans">{copyText(copy, "nav.clans")}</Link><Link href="/glossary">{copyText(copy, "nav.glossary")}</Link><Link href="/about">{copyText(copy, "banner.link")}</Link><Link href="/onboarding">{copyText(copy, "nav.identity")}</Link></div></div><div className="footer-bottom"><p>{copyText(copy, "footer.pronunciation")}</p><p>{copyText(copy, "footer.privacy")}</p></div></div></footer>
  </body></html>;
}
