export class ValidationError extends Error {
  constructor(public errors: Array<{ field: string; message: string }>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class AgentExecutionError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'AgentExecutionError';
  }
}
