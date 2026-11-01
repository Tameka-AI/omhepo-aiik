import type { CulturalScope, SourceType, VerificationStatus } from "./index";

export interface RetrievedChunk {
  entryId: string;
  chunkId: string;
  heading?: string;
  text: string;
  score: number;
  accessTier: "public";
  verification: VerificationStatus;
  attribution: string;
}

export type QueryIntent =
  | "knowledge"
  | "ritual-howto"
  | "medical"
  | "lineage-personal"
  | "smalltalk"
  | "out-of-scope";

export interface ChatResponse {
  text: string;
  citations: { entryId: string; title: string; verification: VerificationStatus }[];
  grounded: boolean;
  intent: QueryIntent;
  safetyNotice?: string;
}

export interface SourceReference {
  entryId: string;
  title: string;
  verification: VerificationStatus;
  attribution: string;
  sourceType: SourceType;
  href: string;
  scope?: CulturalScope;
}

export interface GroundedExcerpt extends SourceReference {
  chunkId: string;
  quote: string;
}

export interface GroundedChatResponse extends ChatResponse {
  citations: SourceReference[];
  excerpts: GroundedExcerpt[];
  redirects: SourceReference[];
  mode: "simulated" | "provider" | "simulated-fallback" | "refusal" | "unavailable";
  modeNotice?: string;
}

export interface ChatPrompts {
  system: string;
  culturalSafety: string;
  refusals: string;
  contract: string;
  intentRules: string;
}
