import type { Language, LocalizedText } from "./index";

export interface UserIdentity {
  displayName: string;
  givenNames?: LocalizedText[];
  nameMeaning?: string;
  maternalClanId?: string;
  paternalClanId?: string;
  birthContext?: {
    place?: string;
    bornInExile?: boolean;
    note?: string;
  };
  preferredLanguage: Language;
  notes?: string;
  consent: {
    storedLocallyOnly: true;
    mayPersonaliseChat: boolean;
  };
  createdAt: string;
}
