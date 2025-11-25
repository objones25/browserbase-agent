import { Stagehand, AgentResult } from "@browserbasehq/stagehand";
import { ValidatedRequest } from "../validation/schemas";
import { DEFAULT_SYSTEM_PROMPT } from "../config/models";
import { AgentExecutionError } from "../utils/errors";

export { type AgentResult };

/**
 * Substitutes %variable% placeholders in the prompt with actual values
 * Variables are not sent to LLM - they're substituted client-side for security
 */
function substituteVariables(
  prompt: string,
  variables?: Record<string, string>
): string {
  if (!variables) return prompt;

  let result = prompt;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`%${key}%`, "g"), value);
  }
  return result;
}

/**
 * Creates a redacted version of text by replacing variable values with [REDACTED]
 * Used for logging to prevent sensitive data from appearing in logs
 */
function redactVariables(
  text: string,
  variables?: Record<string, string>
): string {
  if (!variables) return text;

  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    // Replace all occurrences of the actual value with [REDACTED:{key}]
    result = result.replace(new RegExp(escapeRegExp(value), "g"), `[REDACTED:${key}]`);
  }
  return result;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class AgentExecutor {
  async execute(
    stagehand: Stagehand,
    request: ValidatedRequest
  ): Promise<AgentResult> {
    try {
      const page = stagehand.page;

      // Navigate to starting URL if provided
      if (request.url) {
        await page.goto(request.url, { waitUntil: "domcontentloaded" });

        // Wait for iframes to load if iframe support is enabled
        if (request.iframes) {
          await page.waitForLoadState("networkidle");
        }
      }

      // Substitute variables in prompt (for sensitive data)
      const instruction = substituteVariables(request.prompt, request.variables);

      // Create agent - uses model configured in Stagehand init
      const agent = stagehand.agent({
        instructions: request.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        // Pass MCP server URLs for external tool integrations
        integrations: request.integrations,
      });

      // Execute the task with all options
      const result = await agent.execute({
        instruction,
        maxSteps: request.maxSteps || 20,
        waitBetweenActions: request.waitBetweenActions,
        // Pass context directly to execute instead of appending to system prompt
        context: request.context,
      });

      return result;
    } catch (error) {
      throw new AgentExecutionError(
        `Agent execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }
}
