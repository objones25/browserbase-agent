export type ModelProvider = 'openai' | 'anthropic' | 'google';

export const MODEL_PROVIDERS: Record<ModelProvider, {
  envKey: keyof import('../types/environment').Env;
  defaultModel: string;
}> = {
  google: {
    envKey: 'GOOGLE_API_KEY',
    defaultModel: 'google/gemini-2.5-flash'
  },
  anthropic: {
    envKey: 'ANTHROPIC_API_KEY',
    defaultModel: 'anthropic/claude-3-7-sonnet-latest'
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'openai/gpt-4.1'
  }
};

// Gemini 2.5 Flash recommended by Stagehand docs for speed/cost balance
export const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful browser automation agent. Complete tasks efficiently and accurately by interacting with web pages naturally. Fill forms, click buttons, navigate pages, and extract information as needed. Always verify your actions are successful before proceeding to the next step.`;
