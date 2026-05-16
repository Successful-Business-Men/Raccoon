import Anthropic from "@anthropic-ai/sdk";

// DECISION: model id is configurable via ANTHROPIC_MODEL. Spec calls for
// claude-sonnet-4-5; bump to claude-sonnet-4-6 (or newer) by setting the env var.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

let _client: Anthropic | null = null;

export function anthropic() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  _client = new Anthropic({ apiKey });
  return _client;
}
