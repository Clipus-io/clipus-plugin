export interface ClipusConfig {
  apiKey: string;
  baseUrl: string;
}

export class MissingKeyError extends Error {
  constructor() {
    super(
      "CLIPUS_API_KEY is missing or invalid. Run /clipus:connect to create a key " +
        "(requires a Clipus Growth plan or above) and set CLIPUS_API_KEY.",
    );
    this.name = "MissingKeyError";
  }
}

const DEFAULT_BASE_URL = "https://www.clipus.io";

export function loadConfig(env: Record<string, string | undefined>): ClipusConfig {
  const apiKey = env.CLIPUS_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith("sk_live_")) {
    throw new MissingKeyError();
  }
  const baseUrl = (env.CLIPUS_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return { apiKey, baseUrl };
}

export function maskKey(key: string): string {
  if (key.length <= 12) return "sk_live_...";
  return `sk_live_...${key.slice(-4)}`;
}
