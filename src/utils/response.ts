import { AgentResult } from '@browserbasehq/stagehand';
import { ValidationError, ConfigurationError, AgentExecutionError } from './errors';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export function formatSuccess(result: AgentResult): Response {
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

export function formatError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return new Response(JSON.stringify({
      error: 'Validation failed',
      details: error.errors
    }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  }

  if (error instanceof ConfigurationError) {
    return new Response(JSON.stringify({
      error: 'Configuration error',
      message: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  }

  if (error instanceof AgentExecutionError) {
    return new Response(JSON.stringify({
      error: 'Agent execution failed',
      message: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  }

  return new Response(JSON.stringify({
    error: 'Internal server error',
    message: error instanceof Error ? error.message : 'Unknown error'
  }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
}
