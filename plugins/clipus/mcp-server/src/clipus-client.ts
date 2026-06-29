import type { ClipusConfig } from "./config";

export class ClipusApiError extends Error {
  status: number;
  userMessage: string;
  constructor(status: number, userMessage: string, raw?: string) {
    super(raw || userMessage);
    this.name = "ClipusApiError";
    this.status = status;
    this.userMessage = userMessage;
  }
}

export interface CreateCampaignInput {
  url: string;
  languages?: string[];
  title?: string;
  webhook_url?: string;
}

export interface CreateCampaignResult {
  campaignId: string;
  jobId: string | undefined;
  status: string;
}

export interface CampaignVideo {
  id: string;
  platform: string;
  status: string;
  fileUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
}

export interface CampaignStatus {
  campaignId: string;
  status: string;
  url: string;
  title: string | null;
  languages: string[];
  createdAt: string;
  videos: CampaignVideo[];
}

// POST /api/v1/campaigns blocks while Clipus crawls the site synchronously.
// Server default maxDuration ~300s; client aborts at 180s and tells the user to check the dashboard.
const TIMEOUT_MS = 180_000;

function mapError(status: number, rawError: string | undefined): string {
  switch (status) {
    case 400:
      return rawError || "Invalid request (check the URL or language count).";
    case 401:
      return "Your Clipus API key is invalid. Run /clipus:connect to set a valid sk_live_ key.";
    case 403:
      return "Clipus API access requires a Growth plan or above. Upgrade at https://clipus.io/pricing";
    case 404:
      return "Campaign not found. Check the campaign id.";
    case 408:
      return "Clipus took too long to respond. The campaign may still have been created — check your Clipus dashboard.";
    case 422:
      return "Could not capture screenshots from this URL — the page may block bots or require login.";
    case 429:
      return rawError || "Monthly video limit reached. Upgrade your plan to create more.";
    default:
      return rawError || `Clipus API error (HTTP ${status}).`;
  }
}

async function request(cfg: ClipusConfig, path: string, init: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(`${cfg.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { ...(init.headers || {}), "content-type": "application/json", "x-api-key": cfg.apiKey },
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ClipusApiError(408, mapError(408, undefined));
    }
    throw new ClipusApiError(0, "Could not reach Clipus. Check your network and CLIPUS_BASE_URL.");
  }
  clearTimeout(timer);

  const json = (await resp.json().catch(() => ({}))) as { error?: string };
  if (!resp.ok) {
    throw new ClipusApiError(resp.status, mapError(resp.status, json.error), json.error);
  }
  return json;
}

export async function createCampaign(cfg: ClipusConfig, input: CreateCampaignInput): Promise<CreateCampaignResult> {
  const body: Record<string, unknown> = { url: input.url };
  if (input.languages?.length) body.languages = input.languages;
  if (input.title) body.title = input.title;
  if (input.webhook_url) body.webhook_url = input.webhook_url;

  const json = (await request(cfg, "/api/v1/campaigns", { method: "POST", body: JSON.stringify(body) })) as {
    campaign_id: string;
    job_id?: string;
    status: string;
  };
  return { campaignId: json.campaign_id, jobId: json.job_id, status: json.status };
}

export async function getCampaign(cfg: ClipusConfig, campaignId: string): Promise<CampaignStatus> {
  const json = (await request(cfg, `/api/v1/campaigns/${encodeURIComponent(campaignId)}`, { method: "GET" })) as {
    campaign_id: string;
    status: string;
    url: string;
    title: string | null;
    languages: string[];
    created_at: string;
    videos: Array<{
      id: string;
      platform: string;
      status: string;
      file_url: string | null;
      duration_seconds: number | null;
      published_at: string | null;
    }>;
  };
  return {
    campaignId: json.campaign_id,
    status: json.status,
    url: json.url,
    title: json.title,
    languages: json.languages ?? [],
    createdAt: json.created_at,
    videos: (json.videos ?? []).map((v) => ({
      id: v.id,
      platform: v.platform,
      status: v.status,
      fileUrl: v.file_url,
      durationSeconds: v.duration_seconds,
      publishedAt: v.published_at,
    })),
  };
}
