import { Env } from "../types/environment";
import { agentRequestSchema } from "../validation/schemas";
import { StagehandService } from "../services/stagehand-service";
import { AgentExecutor } from "../services/agent-executor";
import { ValidationError, ConfigurationError } from "../utils/errors";
import { formatSuccess, formatError } from "../utils/response";
import { MODEL_PROVIDERS, DEFAULT_MODEL } from "../config/models";

function getApiKeyForModel(model: string, env: Env): string {
  const provider = model.split("/")[0] as keyof typeof MODEL_PROVIDERS;
  const config = MODEL_PROVIDERS[provider];

  if (!config) {
    throw new ConfigurationError(`Unknown model provider: ${provider}`);
  }

  const apiKey = env[config.envKey];
  if (!apiKey) {
    throw new ConfigurationError(
      `API key not configured for provider: ${provider}. Set ${config.envKey} secret.`
    );
  }

  return apiKey as string;
}

export async function handleAgentRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const stagehandService = new StagehandService(env);

  try {
    // Validate request
    const body = await request.json();
    const parsed = agentRequestSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidationError(errors);
    }

    const modelName = parsed.data.model || DEFAULT_MODEL;
    const apiKey = getApiKeyForModel(modelName, env);

    // Initialize Stagehand with CF Browser Rendering
    await stagehandService.initialize({
      modelName,
      modelApiKey: apiKey,
      systemPrompt: parsed.data.systemPrompt,
      domSettleTimeoutMs: parsed.data.domSettleTimeoutMs,
      // Enable verbose logging for development, disable in production
      verbose: 1,
    });

    // Execute agent
    const executor = new AgentExecutor();
    const result = await executor.execute(
      stagehandService.getInstance(),
      parsed.data
    );

    // Cleanup (non-blocking)
    ctx.waitUntil(stagehandService.cleanup());

    return formatSuccess(result);
  } catch (error) {
    ctx.waitUntil(stagehandService.cleanup());
    return formatError(error);
  }
}
