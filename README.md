# Browserbase Agent

A Cloudflare Worker that exposes an AI-powered browser automation agent as an API. Built with [Stagehand](https://stagehand.dev) and [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/).

## Features

- Natural language browser automation via REST API
- Multiple LLM provider support (Google Gemini, OpenAI, Anthropic)
- Secure variable substitution for sensitive data (passwords, API keys)
- iframe support for embedded content
- Configurable timeouts and action delays
- Full action history in responses

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account with Browser Rendering enabled
- API key for at least one LLM provider (Google, OpenAI, or Anthropic)

### Installation

```bash
npm install
```

### Configure Secrets

Set your LLM provider API key(s):

```bash
# For Google Gemini (default)
npx wrangler secret put GOOGLE_API_KEY

# For OpenAI
npx wrangler secret put OPENAI_API_KEY

# For Anthropic
npx wrangler secret put ANTHROPIC_API_KEY
```

For local development, create a `.dev.vars` file:

```
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Run Locally

```bash
npm run dev
```

### Deploy

```bash
npm run deploy
```

## API Reference

### POST /

Execute a browser automation task.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Natural language instruction for the agent |
| `url` | string | No | Starting URL to navigate to |
| `model` | string | No | LLM model to use (default: `google/gemini-2.5-flash`) |
| `systemPrompt` | string | No | Custom system prompt for the agent |
| `maxSteps` | number | No | Maximum actions before stopping (default: 20, max: 50) |
| `context` | string | No | Additional context appended to system prompt |
| `variables` | object | No | Key-value pairs for secure variable substitution |
| `domSettleTimeoutMs` | number | No | Wait time for dynamic content (1000-60000ms) |
| `iframes` | boolean | No | Enable iframe support (default: false) |
| `waitBetweenActions` | number | No | Delay between actions in ms (0-10000) |

#### Example Request

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for Stagehand browser automation",
    "url": "https://google.com",
    "maxSteps": 15
  }'
```

#### Example with Variables (Secure Login)

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Login with username %username% and password %password%",
    "url": "https://example.com/login",
    "variables": {
      "username": "user@example.com",
      "password": "secretpassword"
    }
  }'
```

Variables are substituted client-side and never sent to the LLM.

#### Response

```json
{
  "success": true,
  "message": "Task completed successfully",
  "actions": [
    {
      "type": "goto",
      "url": "https://google.com",
      "timestamp": 1234567890
    },
    {
      "type": "act",
      "action": "type 'Stagehand' into search box",
      "playwrightArguments": {
        "selector": "xpath=/html/body/...",
        "method": "fill",
        "arguments": ["Stagehand"]
      }
    }
  ],
  "completed": true,
  "usage": {
    "input_tokens": 6949,
    "output_tokens": 0,
    "inference_time_ms": 12026
  }
}
```

## Supported Models

| Provider | Model | Notes |
|----------|-------|-------|
| Google | `google/gemini-2.5-flash` | Default, recommended for speed/cost |
| OpenAI | `openai/gpt-4.1` | High accuracy for complex sites |
| Anthropic | `anthropic/claude-3-7-sonnet-latest` | Excellent reasoning |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Client Request │────▶│ Cloudflare Worker│────▶│ Browser Rendering│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌─────────────┐           ┌─────────────┐
                        │  Stagehand  │◀─────────▶│   Browser   │
                        │   Agent     │           │   (Chrome)  │
                        └─────────────┘           └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  LLM API    │
                        │ (Gemini/etc)│
                        └─────────────┘
```

## Development

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Run local test script
./test-local.sh
```

## License

MIT
