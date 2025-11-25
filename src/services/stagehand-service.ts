import { Stagehand } from "@browserbasehq/stagehand";
import { endpointURLString } from "@cloudflare/playwright";
import { Env } from "../types/environment";
import { DEFAULT_MODEL } from "../config/models";

export interface StagehandConfig {
  modelName?: string;
  modelApiKey: string;
  systemPrompt?: string;
  domSettleTimeoutMs?: number;
  verbose?: 0 | 1 | 2;
}

export class StagehandService {
  private stagehand: Stagehand | null = null;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async initialize(config: StagehandConfig): Promise<Stagehand> {
    const cdpUrl = endpointURLString(this.env.BROWSER);

    this.stagehand = new Stagehand({
      env: "LOCAL",
      localBrowserLaunchOptions: { cdpUrl },
      modelName: config.modelName || DEFAULT_MODEL,
      modelClientOptions: {
        apiKey: config.modelApiKey,
      },
      enableCaching: false,
      // Default to 0 in production to prevent secrets in logs
      verbose: config.verbose ?? 0,
      logger: (message) => console.log(JSON.stringify(message)),
      // DOM settle timeout for dynamic SPAs
      domSettleTimeoutMs: config.domSettleTimeoutMs,
    });

    await this.stagehand.init();

    return this.stagehand;
  }

  getInstance(): Stagehand {
    if (!this.stagehand) throw new Error("Stagehand not initialized");
    return this.stagehand;
  }

  async cleanup(): Promise<void> {
    if (this.stagehand) {
      try {
        await this.stagehand.close();
      } catch {
        // Ignore cleanup errors
      }
      this.stagehand = null;
    }
  }
}
