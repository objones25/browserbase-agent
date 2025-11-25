import { z } from 'zod';

export const agentRequestSchema = z.object({
  // Core parameters
  prompt: z.string().min(1, 'Prompt is required').max(10000),
  model: z.string().optional(),
  url: z.string().url().optional(),
  systemPrompt: z.string().max(5000).optional(),
  maxSteps: z.number().int().min(1).max(50).optional().default(20),

  // Additional context for the agent
  context: z.string().max(2000).optional(),

  // Variables for sensitive data (not sent to LLM)
  // Usage: prompt "Login with %username%" + variables: { username: "actual-value" }
  variables: z.record(z.string(), z.string()).optional(),

  // DOM settle timeout for dynamic SPAs (ms)
  domSettleTimeoutMs: z.number().int().min(1000).max(60000).optional(),

  // Enable iframe support
  iframes: z.boolean().optional().default(false),

  // Wait between actions (ms) - useful for rate-limited sites
  waitBetweenActions: z.number().int().min(0).max(10000).optional(),

  // MCP server integrations (URLs to MCP servers)
  // Example: ["https://mcp.exa.ai/mcp?exaApiKey=xxx"]
  integrations: z.array(z.string().url()).optional(),

  // Enable streaming response via Server-Sent Events
  stream: z.boolean().optional().default(false),
});

export type ValidatedRequest = z.infer<typeof agentRequestSchema>;
