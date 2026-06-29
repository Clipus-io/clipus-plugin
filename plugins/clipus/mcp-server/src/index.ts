#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, MissingKeyError } from "./config";
import { createCampaign, getCampaign, ClipusApiError } from "./clipus-client";

const server = new McpServer({ name: "clipus-mcp", version: "0.1.0" });

function errText(err: unknown): { content: { type: "text"; text: string }[]; isError: true } {
  const msg =
    err instanceof ClipusApiError
      ? err.userMessage
      : err instanceof MissingKeyError
        ? err.message
        : "Unexpected error talking to Clipus.";
  return { content: [{ type: "text", text: msg }], isError: true };
}

server.tool(
  "clipus_create_campaign",
  "Create a real Clipus video campaign from a SaaS URL. Requires a Growth-plan API key. The call blocks while Clipus crawls the site (up to ~3 min).",
  {
    url: z.string().url(),
    languages: z.array(z.string()).optional(),
    title: z.string().optional(),
    webhook_url: z.string().url().optional(),
  },
  async (args) => {
    try {
      const cfg = loadConfig(process.env);
      const res = await createCampaign(cfg, args);
      return {
        content: [
          {
            type: "text",
            text: `Campaign created. campaign_id=${res.campaignId} status=${res.status}. Poll with clipus_get_campaign.`,
          },
        ],
      };
    } catch (err) {
      return errText(err);
    }
  },
);

server.tool(
  "clipus_get_campaign",
  "Get the status of a Clipus campaign and its rendered video file URLs.",
  { campaign_id: z.string().min(1) },
  async (args) => {
    try {
      const cfg = loadConfig(process.env);
      const res = await getCampaign(cfg, args.campaign_id);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    } catch (err) {
      return errText(err);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
