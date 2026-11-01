import type { InterfaceCopy } from "@/shared/types/generated";

export function copyText(copy: InterfaceCopy, key: string, values: Record<string, string | number> = {}): string {
  const value = copy[key];
  if (typeof value !== "string") throw new Error(`Missing interface key: ${key}`);
  return value.replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}

export function publicUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function pickCopy(copy: InterfaceCopy, prefixes: string[]): InterfaceCopy {
  return Object.fromEntries(Object.entries(copy).filter(([key]) => prefixes.some((prefix) => key.startsWith(prefix))));
}
