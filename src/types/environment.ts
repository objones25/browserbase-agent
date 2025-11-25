export interface Env {
  // Cloudflare Browser Rendering binding
  BROWSER: Fetcher;

  // Model API keys (set via wrangler secret)
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
}
