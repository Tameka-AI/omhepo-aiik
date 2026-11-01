import { z } from "zod";
import { LocalizedTextSchema } from "./index";
import type { UserIdentity } from "../types/identity";

const optionalText = z.string().max(1000).optional();
const clanId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160).optional();

export const UserIdentitySchema: z.ZodType<UserIdentity> = z.strictObject({
  displayName: z.string().trim().min(1).max(100),
  givenNames: z.array(LocalizedTextSchema).max(10).optional(),
  nameMeaning: optionalText,
  maternalClanId: clanId,
  paternalClanId: clanId,
  birthContext: z.strictObject({ place: optionalText, bornInExile: z.boolean().optional(), note: optionalText }).optional(),
  preferredLanguage: z.enum(["en", "kwn", "ndo", "ng"]),
  notes: optionalText,
  consent: z.strictObject({ storedLocallyOnly: z.literal(true), mayPersonaliseChat: z.boolean() }),
  createdAt: z.iso.datetime(),
});
