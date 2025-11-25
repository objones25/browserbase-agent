import { Env } from '../types/environment';
import { MODEL_PROVIDERS, DEFAULT_MODEL, ModelProvider } from '../config/models';
import { ConfigurationError } from '../utils/errors';

export class ModelFactory {
  constructor(private env: Env) {}

  createModelConfig(modelString?: string): { modelName: string; apiKey: string } {
    const model = modelString || DEFAULT_MODEL;
    const provider = this.parseProvider(model);
    const providerConfig = MODEL_PROVIDERS[provider];

    const apiKey = this.env[providerConfig.envKey as keyof Env] as string;
    if (!apiKey) {
      throw new ConfigurationError(`Missing API key: ${providerConfig.envKey}`);
    }

    return { modelName: model, apiKey };
  }

  private parseProvider(model: string): ModelProvider {
    if (model.startsWith('google/')) return 'google';
    if (model.startsWith('anthropic/')) return 'anthropic';
    if (model.startsWith('openai/')) return 'openai';
    throw new ConfigurationError(`Unknown model provider: ${model}`);
  }
}
