import { getClans, getCopy } from "@/modules/content";
import { copyText, pickCopy } from "@/components/copy";
import { OnboardingForm } from "@/components/OnboardingForm";

export async function generateMetadata() { return { title: copyText(getCopy(), "nav.identity") }; }

export default function OnboardingPage() {
  const copy = getCopy();
  const clans = getClans().map(({ data }) => ({ id: data.id, label: data.names.map((name) => name.text).join(" · ") }));
  return <div className="container onboarding-page"><header className="page-heading"><p className="eyebrow">{copyText(copy, "identity.eyebrow")}</p><h1>{copyText(copy, "identity.title")}</h1><p>{copyText(copy, "identity.description")}</p></header><OnboardingForm clans={clans} copy={pickCopy(copy, ["identity.", "language."])} /></div>;
}
