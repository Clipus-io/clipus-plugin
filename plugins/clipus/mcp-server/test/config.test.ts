import { describe, it, expect } from "vitest";
import { loadConfig, maskKey, MissingKeyError } from "../src/config";

describe("loadConfig", () => {
  it("reads CLIPUS_API_KEY and defaults base url", () => {
    const cfg = loadConfig({ CLIPUS_API_KEY: "sk_live_abc123" });
    expect(cfg.apiKey).toBe("sk_live_abc123");
    expect(cfg.baseUrl).toBe("https://www.clipus.io");
  });

  it("honors CLIPUS_BASE_URL and strips trailing slash", () => {
    const cfg = loadConfig({ CLIPUS_API_KEY: "sk_live_x", CLIPUS_BASE_URL: "https://staging.clipus.io/" });
    expect(cfg.baseUrl).toBe("https://staging.clipus.io");
  });

  it("throws MissingKeyError when key absent", () => {
    expect(() => loadConfig({})).toThrow(MissingKeyError);
  });

  it("throws MissingKeyError when key has wrong prefix", () => {
    expect(() => loadConfig({ CLIPUS_API_KEY: "nope" })).toThrow(MissingKeyError);
  });
});

describe("maskKey", () => {
  it("masks all but prefix and last 4", () => {
    expect(maskKey("sk_live_0123456789abcdef")).toBe("sk_live_...cdef");
  });
});
