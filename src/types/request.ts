export interface AgentRequestBody {
  prompt: string;
  model?: string;
  url?: string;
  systemPrompt?: string;
  maxSteps?: number;
}

export interface AgentAction {
  type: string;
  reasoning?: string;
  taskCompleted: boolean;
  taskComplete?: boolean;
  action?: string;
  playwrightArguments?: Record<string, unknown>;
  pageUrl: string;
  timestamp: number;
}

export interface AgentUsage {
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens?: number;
  cached_input_tokens?: number;
  inference_time_ms: number;
}

export interface AgentResult {
  success: boolean;
  message: string;
  actions: AgentAction[];
  completed: boolean;
  usage: AgentUsage;
}
