import { UserIdentitySchema } from "../../shared/schemas/identity";
import type { UserIdentity } from "../../shared/types/identity";

const storageKey = "omhepo-aiik.identity.v1";
type ReadResult = { status: "saved"; identity: UserIdentity } | { status: "empty" | "invalid" | "unavailable" };

export function readIdentity(storage: Pick<Storage, "getItem">): ReadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey);
  } catch { return { status: "unavailable" }; }
  if (raw === null) return { status: "empty" };
  if (raw.length > 20000) return { status: "invalid" };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { status: "invalid" }; }
  const parsed = UserIdentitySchema.safeParse(value);
  return parsed.success ? { status: "saved", identity: parsed.data } : { status: "invalid" };
}

export function saveIdentity(storage: Pick<Storage, "setItem">, value: UserIdentity): boolean {
  const parsed = UserIdentitySchema.safeParse(value);
  if (!parsed.success) return false;
  try {
    storage.setItem(storageKey, JSON.stringify(parsed.data));
    return true;
  } catch { return false; }
}

export function removeIdentity(storage: Pick<Storage, "removeItem">): boolean {
  try { storage.removeItem(storageKey); return true; } catch { return false; }
}
