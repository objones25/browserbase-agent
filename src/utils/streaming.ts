import { AgentResult } from "../services/agent-executor";

export interface StreamEvent {
  type: "log" | "action" | "result" | "error";
  data: unknown;
  timestamp: number;
}

interface LogMessage {
  category?: string;
  message: string;
  level?: number;
  auxiliary?: Record<string, { value: string; type: string }>;
}

/**
 * Formats a log message into human-readable text
 */
function formatLogMessage(log: LogMessage): string {
  const { category, message, auxiliary } = log;

  let output = "";

  // Add category prefix
  if (category) {
    output += `[${category.toUpperCase()}] `;
  }

  output += message;

  // Add auxiliary info
  if (auxiliary) {
    const auxStr = Object.entries(auxiliary)
      .map(([key, val]) => `${key}=${val.value}`)
      .join(", ");
    output += ` (${auxStr})`;
  }

  return output;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Redacts sensitive variable values from text for safe logging
 */
function redactSensitiveData(
  text: string,
  variables?: Record<string, string>
): string {
  if (!variables) return text;

  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    // Replace all occurrences of the actual value with [REDACTED:{key}]
    const escapedValue = escapeRegExp(value);
    result = result.replace(new RegExp(escapedValue, "g"), `[REDACTED:${key}]`);
  }
  return result;
}

/**
 * Creates a streaming response handler for agent execution
 * Returns a logger function and a ReadableStream for SSE
 */
export function createStreamingHandler(variables?: Record<string, string>): {
  logger: (message: unknown) => void;
  stream: ReadableStream;
  sendResult: (result: AgentResult) => void;
  sendError: (error: Error) => void;
  close: () => void;
} {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
    cancel() {
      controller = null;
    },
  });

  function sendMessage(text: string) {
    if (!controller) return;

    try {
      // Redact sensitive data before sending
      const redacted = redactSensitiveData(text, variables);
      controller.enqueue(encoder.encode(`${redacted}\n`));
    } catch (error) {
      console.error("Error sending stream message:", error);
    }
  }

  const logger = (message: unknown) => {
    const log = message as LogMessage;

    // Skip overly verbose logs
    if (log.category === "extraction" && log.message.includes("Getting accessibility tree data")) {
      return;
    }

    // If this is an extraction completion message, show the extracted data
    if (log.category === "extraction" && log.message.includes("extraction completed successfully")) {
      const formatted = formatLogMessage(log);
      sendMessage(formatted);

      // Try to extract and display the result
      if (log.auxiliary && log.auxiliary.extraction_response) {
        try {
          const extractionData = JSON.parse(log.auxiliary.extraction_response.value);
          if (extractionData.result) {
            sendMessage("\n📄 Extracted Content:");
            if (typeof extractionData.result === 'string') {
              sendMessage(`   ${extractionData.result}`);
            } else {
              const formatted = JSON.stringify(extractionData.result, null, 2);
              const indented = formatted.split('\n').map(line => `   ${line}`).join('\n');
              sendMessage(indented);
            }
            sendMessage("");
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return;
    }

    const formatted = formatLogMessage(log);
    sendMessage(formatted);
  };

  const sendResult = (result: AgentResult) => {
    sendMessage("\n" + "=".repeat(60));
    sendMessage("FINAL RESULT");
    sendMessage("=".repeat(60) + "\n");

    sendMessage(`Status: ${result.success ? "✓ Success" : "✗ Failed"}\n`);
    sendMessage(`Message: ${result.message}\n`);

    if (result.actions && result.actions.length > 0) {
      sendMessage(`Actions taken: ${result.actions.length}`);
      result.actions.forEach((action, i) => {
        let actionDesc = "";
        if (action.type === "goto") {
          actionDesc = `→ Navigated to: ${action.url || action.pageUrl}`;
        } else if (action.type === "ariaTree") {
          actionDesc = `→ Analyzed page structure`;
        } else if (action.type === "act") {
          actionDesc = `→ Action: ${action.action}`;
        } else if (action.type === "extract") {
          // Check multiple possible property names for the extracted data
          const extractedData = (action as any).extract || (action as any).result || (action as any).extraction;

          if (extractedData) {
            sendMessage(`  ${i + 1}. → Extracted data:`);
            try {
              // If it's a string, display it directly; otherwise format as JSON
              if (typeof extractedData === 'string') {
                sendMessage(`     ${extractedData}`);
              } else {
                const formatted = JSON.stringify(extractedData, null, 2);
                // Indent each line for better formatting
                const indented = formatted.split('\n').map(line => `     ${line}`).join('\n');
                sendMessage(indented);
              }
            } catch {
              // Ignore formatting errors
            }
          } else {
            sendMessage(`  ${i + 1}. → Extracted data`);
          }
        } else if (action.type === "close") {
          actionDesc = `→ Task completed: ${action.reasoning || "Done"}`;
          sendMessage(`  ${i + 1}. ${actionDesc}`);
        } else {
          actionDesc = `→ ${action.type}`;
          sendMessage(`  ${i + 1}. ${actionDesc}`);
        }

        // For goto, ariaTree, and act, send the message here
        if (action.type === "goto" || action.type === "ariaTree" || action.type === "act") {
          sendMessage(`  ${i + 1}. ${actionDesc}`);
        }
      });
      sendMessage("");
    }

    if (result.usage) {
      sendMessage(`Usage:`);
      sendMessage(`  Input tokens: ${result.usage.input_tokens.toLocaleString()}`);
      sendMessage(`  Output tokens: ${result.usage.output_tokens.toLocaleString()}`);
      sendMessage(`  Inference time: ${(result.usage.inference_time_ms / 1000).toFixed(2)}s`);
    }

    sendMessage("=".repeat(60));
  };

  const sendError = (error: Error) => {
    sendMessage(`\n❌ ERROR: ${error.message}\n`);
  };

  const close = () => {
    if (controller) {
      try {
        controller.close();
      } catch (error) {
        // Controller might already be closed
        console.error("Error closing stream:", error);
      }
      controller = null;
    }
  };

  return { logger, stream, sendResult, sendError, close };
}
