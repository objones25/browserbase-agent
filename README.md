# Browserbase Agent

A Cloudflare Worker that exposes an AI-powered browser automation agent as an API. Built with [Stagehand](https://stagehand.dev) and [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/).

## Features

- Natural language browser automation via REST API
- Multiple LLM provider support (Google Gemini, OpenAI, Anthropic)
- **MCP integrations** for external tools (search, databases, documentation)
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
| `integrations` | string[] | No | MCP server URLs for external tool access |
| `stream` | boolean | No | Enable streaming response via Server-Sent Events (default: false) |

#### Example Request

```bash
curl -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for Stagehand browser automation",
    "url": "https://google.com",
    "maxSteps": 15
  }'
```

#### Example with Variables (Secure Login)

```bash
curl -X POST https://browserbase-agent.ap-a98.workers.dev \
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

#### Example with Streaming

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for Stagehand browser automation",
    "url": "https://google.com",
    "maxSteps": 15,
    "stream": true
  }'
```

Streaming responses use Server-Sent Events (SSE) and send real-time updates as the agent executes. Each event is JSON formatted:

```json
data: {"type":"log","data":{...},"timestamp":1234567890}

data: {"type":"action","data":{...},"timestamp":1234567890}

data: {"type":"result","data":{...},"timestamp":1234567890}
```

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

## MCP Integrations

The agent supports [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) integrations for external tools. Pass MCP server URLs via the `integrations` parameter to give the agent access to documentation, search, databases, and more.

#### Example with Cloudflare Docs MCP (with Streaming)

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search the Cloudflare documentation for information about Browser Rendering and explain how to use it",
    "integrations": [
      "https://docs.mcp.cloudflare.com/mcp"
    ],
    "maxSteps": 10,
    "stream": true
  }'
```

This example uses the Cloudflare documentation MCP server to search and retrieve information without opening a browser, while streaming the results in real-time.

#### Example with Context7 (Documentation Lookup)

```bash
curl -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Look up the Stagehand documentation for the act() method and summarize how to use it",
    "integrations": [
      "https://mcp.context7.com/mcp?apiKey=YOUR_CONTEXT7_API_KEY"
    ],
    "maxSteps": 10
  }'
```

#### Supported MCP Servers

Any MCP-compatible server can be used. Popular options include:

| Server | Description |
|--------|-------------|
| [Cloudflare Docs](https://docs.mcp.cloudflare.com/mcp) | Search Cloudflare documentation |
| [Cloudflare Browser](https://browser.mcp.cloudflare.com/mcp) | Browser rendering automation |
| [Cloudflare Radar](https://radar.mcp.cloudflare.com/mcp) | Internet insights and analytics |
| [Context7](https://context7.com) | Documentation lookup for libraries |
| [Tavily](https://tavily.com) | Web search |
| Custom servers | Any MCP-compliant endpoint |

The agent will automatically discover available tools from the MCP server and use them when appropriate for the task.

## Advanced Examples

### Multi-step Research

Research React 19 features by navigating through documentation:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to react.dev, navigate to the Blog, find the React 19 announcement, and summarize the key new features",
    "url": "https://react.dev",
    "maxSteps": 25,
    "context": "Focus on features related to Server Components, Actions, and new hooks",
    "stream": true
  }'
```

### Documentation Search with MCP

Use Cloudflare Docs MCP to search without opening a browser:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for information about Workers AI and explain how to use it for text generation",
    "integrations": [
      "https://docs.mcp.cloudflare.com/mcp"
    ],
    "maxSteps": 10,
    "stream": true
  }'
```

### Wikipedia Information Extraction

Extract structured information from Wikipedia:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to the Wikipedia page for Artificial Intelligence and extract the first paragraph that defines what AI is",
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "maxSteps": 10,
    "stream": true
  }'
```

### Product Information Extraction

Extract structured product data from e-commerce pages:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to the Stagehand documentation homepage and extract the main heading and the description text that explains what Stagehand does",
    "url": "https://docs.stagehand.dev",
    "maxSteps": 10,
    "stream": true
  }'
```

### Package Documentation Lookup

Search npm package documentation:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for the Zod npm package, navigate to its page, and summarize what the library does and its main use cases",
    "url": "https://npmjs.com",
    "maxSteps": 20,
    "stream": true
  }'
```

### Blog Content Extraction

Extract article content with metadata:

```bash
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Visit the Cloudflare blog, find the most recent post about AI, and extract the title, author, date, and a summary of the key points",
    "url": "https://blog.cloudflare.com",
    "maxSteps": 20,
    "domSettleTimeoutMs": 3000,
    "stream": true
  }'
```

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
