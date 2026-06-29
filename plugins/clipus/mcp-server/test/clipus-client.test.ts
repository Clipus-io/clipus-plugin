import { describe, it, expect, vi, afterEach } from "vitest";
import { createCampaign, getCampaign, ClipusApiError } from "../src/clipus-client";

const cfg = { apiKey: "sk_live_test", baseUrl: "https://www.clipus.io" };

function mockFetch(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

afterEach(() => vi.restoreAllMocks());

describe("createCampaign", () => {
  it("sends url+languages and returns campaign_id/job_id/status", async () => {
    const fetchMock = mockFetch(200, { success: true, campaign_id: "proj-1", job_id: "job-1", status: "collecting" });
    vi.stubGlobal("fetch", fetchMock);

    const res = await createCampaign(cfg, { url: "https://acme.io", languages: ["en", "ja"] });

    expect(res).toEqual({ campaignId: "proj-1", jobId: "job-1", status: "collecting" });
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(calledUrl).toBe("https://www.clipus.io/api/v1/campaigns");
    expect(init.method).toBe("POST");
    expect(init.headers["x-api-key"]).toBe("sk_live_test");
    expect(JSON.parse(init.body as string)).toEqual({ url: "https://acme.io", languages: ["en", "ja"] });
  });

  it("maps 403 to Growth-plan ClipusApiError", async () => {
    vi.stubGlobal("fetch", mockFetch(403, { success: false, error: "API access requires Growth plan or above." }));
    await expect(createCampaign(cfg, { url: "https://acme.io" })).rejects.toMatchObject({
      status: 403,
      userMessage: expect.stringContaining("Growth plan"),
    });
  });

  it("maps 422 to screenshot-failure message", async () => {
    vi.stubGlobal("fetch", mockFetch(422, { success: false, error: "Could not capture screenshots from this URL." }));
    await expect(createCampaign(cfg, { url: "https://acme.io" })).rejects.toMatchObject({
      status: 422,
      userMessage: expect.stringContaining("screenshot"),
    });
  });

  it("maps 429 to monthly-limit message", async () => {
    vi.stubGlobal("fetch", mockFetch(429, { success: false, error: "Monthly limit reached (10/10)." }));
    await expect(createCampaign(cfg, { url: "https://acme.io" })).rejects.toMatchObject({ status: 429 });
  });
});

describe("getCampaign", () => {
  it("returns status and videos with fileUrl", async () => {
    vi.stubGlobal("fetch", mockFetch(200, {
      success: true,
      campaign_id: "proj-1",
      status: "rendering",
      url: "https://acme.io",
      title: "Acme",
      languages: ["en", "ja"],
      created_at: "2026-06-29T00:00:00Z",
      videos: [{ id: "v1", platform: "youtube", status: "ready", file_url: "https://cdn/x.mp4", duration_seconds: 30, published_at: null }],
    }));

    const res = await getCampaign(cfg, "proj-1");

    expect(res.status).toBe("rendering");
    expect(res.languages).toEqual(["en", "ja"]);
    expect(res.videos[0]).toMatchObject({ platform: "youtube", status: "ready", fileUrl: "https://cdn/x.mp4" });
  });

  it("maps 404 to not-found ClipusApiError", async () => {
    vi.stubGlobal("fetch", mockFetch(404, { success: false, error: "Campaign not found." }));
    await expect(getCampaign(cfg, "nope")).rejects.toMatchObject({ status: 404 });
  });
});

describe("request error paths", () => {
  it("maps an aborted (timeout) request to status 408", async () => {
    // fetch that rejects with an AbortError, simulating the AbortController firing
    vi.stubGlobal("fetch", vi.fn(async () => {
      const e = new Error("aborted");
      e.name = "AbortError";
      throw e;
    }));
    await expect(createCampaign(cfg, { url: "https://acme.io" })).rejects.toMatchObject({
      status: 408,
      userMessage: expect.stringContaining("dashboard"),
    });
  });

  it("maps a network failure to status 0", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));
    await expect(getCampaign(cfg, "proj-1")).rejects.toMatchObject({
      status: 0,
      userMessage: expect.stringContaining("network"),
    });
  });
});
