import type { AccessTier, LocalizedText, Provenance, VerificationStatus } from "./index";

export interface Person {
  id: string;
  names: LocalizedText[];
  clanId?: string;
  role?: string;
  lived?: { from?: string; to?: string; approximate?: boolean };
  accessTier: AccessTier;
  provenance: Provenance;
}

export interface LineageEvent {
  id: string;
  kind: "succession" | "marriage" | "lobola-transfer" | "migration" | "founding" | "other";
  summary: string;
  participants: { personId?: string; clanId?: string; role: string }[];
  when?: { approx: string };
  accessTier: AccessTier;
  verification: VerificationStatus;
  provenance: Provenance;
}
