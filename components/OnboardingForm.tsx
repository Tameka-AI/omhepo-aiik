"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { InterfaceCopy } from "@/shared/types/generated";
import type { Language } from "@/shared/types";
import type { UserIdentity } from "@/shared/types/identity";
import { UserIdentitySchema } from "@/shared/schemas/identity";
import { readIdentity, removeIdentity, saveIdentity } from "@/modules/identity";
import { copyText } from "./copy";
import { ArrowIcon, LockIcon } from "./Icons";

export type ClanOption = { id: string; label: string };

export function OnboardingForm({ clans, copy }: { clans: ClanOption[]; copy: InterfaceCopy }) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [maternal, setMaternal] = useState("");
  const [paternal, setPaternal] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState<UserIdentity | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    try {
      const result = readIdentity(window.localStorage);
      if (result.status === "saved") {
        const value = result.identity;
        setName(value.displayName); setMaternal(value.maternalClanId ?? ""); setPaternal(value.paternalClanId ?? "");
        setLanguage(value.preferredLanguage); setNotes(value.notes ?? ""); setConsent(true); setSaved(value);
      } else if (result.status !== "empty") {
        setMessage(result.status === "invalid" ? "identity.corrupt" : "identity.storageError"); setIsError(true);
      }
    } catch { setMessage("identity.storageError"); setIsError(true); }
    setReady(true);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const knownIds = new Set(clans.map((clan) => clan.id));
    const value: UserIdentity = {
      displayName: name, preferredLanguage: language,
      ...(knownIds.has(maternal) ? { maternalClanId: maternal } : {}),
      ...(knownIds.has(paternal) ? { paternalClanId: paternal } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      consent: { storedLocallyOnly: true, mayPersonaliseChat: false },
      createdAt: saved?.createdAt ?? new Date().toISOString(),
    };
    const parsed = UserIdentitySchema.safeParse(value);
    if (!consent || !parsed.success) { setMessage("identity.invalid"); setIsError(true); return; }
    try {
      if (!saveIdentity(window.localStorage, parsed.data)) throw new Error();
      setSaved(parsed.data); setMessage("identity.saved"); setIsError(false);
    } catch { setMessage("identity.storageError"); setIsError(true); }
  }

  function remove() {
    try {
      if (!removeIdentity(window.localStorage)) throw new Error();
      setSaved(null); setName(""); setMaternal(""); setPaternal(""); setLanguage("en"); setNotes(""); setConsent(false);
      setMessage("identity.deleted"); setIsError(false);
    } catch { setMessage("identity.storageError"); setIsError(true); }
  }

  const connected = [...new Set([saved?.maternalClanId, saved?.paternalClanId].filter((id): id is string => !!id))]
    .map((id) => clans.find((clan) => clan.id === id)).filter((clan): clan is ClanOption => !!clan);

  return <div className="identity-layout"><form className="identity-form" onSubmit={submit}><div className="form-field"><label htmlFor="identity-name">{copyText(copy, "identity.name")}</label><input id="identity-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={copyText(copy, "identity.namePlaceholder")} maxLength={100} required autoComplete="nickname" disabled={!ready} /></div><div className="form-pair"><div className="form-field"><label htmlFor="identity-maternal">{copyText(copy, "identity.maternal")}</label><select id="identity-maternal" value={maternal} onChange={(event) => setMaternal(event.target.value)} disabled={!ready}><option value="">{copyText(copy, "identity.unknown")}</option>{clans.map((clan) => <option key={clan.id} value={clan.id}>{clan.label}</option>)}</select></div><div className="form-field"><label htmlFor="identity-paternal">{copyText(copy, "identity.paternal")}</label><select id="identity-paternal" value={paternal} onChange={(event) => setPaternal(event.target.value)} disabled={!ready}><option value="">{copyText(copy, "identity.unknown")}</option>{clans.map((clan) => <option key={clan.id} value={clan.id}>{clan.label}</option>)}</select></div></div><div className="form-field"><label htmlFor="identity-language">{copyText(copy, "identity.language")}</label><select id="identity-language" value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-describedby="language-note" disabled={!ready}>{(["en", "ng", "kwn", "ndo"] as const).map((value) => <option key={value} value={value}>{copyText(copy, `language.${value}`)}</option>)}</select><p className="field-help" id="language-note">{copyText(copy, "identity.languageNote")}</p></div><div className="form-field"><label htmlFor="identity-notes">{copyText(copy, "identity.notes")}</label><textarea id="identity-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={copyText(copy, "identity.notesPlaceholder")} maxLength={1000} disabled={!ready} /></div><label className="consent-label"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required disabled={!ready} /><span>{copyText(copy, "identity.consent")}</span></label><div className="identity-actions"><button className="button button-primary" type="submit" disabled={!ready}>{copyText(copy, ready ? "identity.save" : "identity.loading")}<ArrowIcon /></button><button className="delete-profile" type="button" onClick={remove} disabled={!ready}>{copyText(copy, "identity.delete")}</button></div>{message && <p className={isError ? "form-error" : "form-success"} role={isError ? "alert" : "status"}>{copyText(copy, message)}</p>}</form><aside className="identity-sidebar"><div className="identity-privacy"><LockIcon /><h2>{copyText(copy, "identity.privacyTitle")}</h2><p>{copyText(copy, "identity.privacy")}</p></div>{connected.length > 0 && <div className="saved-connections"><h2>{copyText(copy, "identity.connectionsTitle")}</h2>{connected.map((clan) => <Link key={clan.id} href={`/clans/${clan.id}`}>{clan.label}<ArrowIcon /></Link>)}</div>}<p className="muted-note">{copyText(copy, "identity.optionalNote")}</p><Link className="text-link" href="/library">{copyText(copy, "identity.back")}<ArrowIcon /></Link></aside></div>;
}
