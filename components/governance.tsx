import type { CulturalScope, Provenance, VerificationStatus } from "@/shared/types";
import type { InterfaceCopy } from "@/shared/types/generated";
import { copyText } from "./copy";
import { LockIcon } from "./Icons";

export function VerificationBadge({ status, copy }: { status: VerificationStatus; copy: InterfaceCopy }) {
  return <span className={`badge verification verification-${status}`}><span className="badge-dot" aria-hidden="true" />{copyText(copy, `verification.${status}`)}</span>;
}

export function SourceBadge({ provenance, copy }: { provenance: Pick<Provenance, "sourceType" | "attribution">; copy: InterfaceCopy }) {
  return <details className="source-badge"><summary><span className="source-dot" aria-hidden="true" />{copyText(copy, `source.${provenance.sourceType}`)}<span className="source-expand" aria-hidden="true">+</span></summary><p>{provenance.attribution}</p></details>;
}

export function ScopeLine({ scope, copy }: { scope?: CulturalScope; copy: InterfaceCopy }) {
  if (!scope) return <p className="scope-line scope-unknown">{copyText(copy, "scope.unavailable")}</p>;
  const origin = [scope.origin.lineage, scope.origin.ethnicGroup].filter(Boolean).join(" · ");
  return <div className="scope-line"><p>{copyText(copy, "scope.documented", { origin })}</p>{scope.origin.region && <p className="scope-region">{scope.origin.region}</p>}<p>{copyText(copy, "scope.relevant", { groups: scope.appliesTo.join(", ") })}</p></div>;
}

export function CrossCulturalBadge({ scope, copy }: { scope?: CulturalScope; copy: InterfaceCopy }) {
  if (!scope?.crossCultural) return null;
  return <aside className="cross-cultural"><strong>{copyText(copy, "scope.crossCultural")}</strong><p>{copyText(copy, "scope.crossCulturalNote", { origin: scope.origin.ethnicGroup })}</p></aside>;
}

export function RestrictedNotice({ note, copy }: { note?: string; copy: InterfaceCopy }) {
  return <aside className="restricted-notice"><LockIcon /><div><h2>{copyText(copy, "restricted.title")}</h2><p>{copyText(copy, "restricted.notice")}</p>{note && <p className="restricted-source-note">{note}</p>}</div></aside>;
}
