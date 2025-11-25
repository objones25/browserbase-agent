#!/bin/bash

# Test MCP integrations with Context7
WORKER_URL="https://browserbase-agent.ap-a98.workers.dev"

# Prompt for API key if not set
if [ -z "$CONTEXT7_API_KEY" ]; then
  read -p "Enter your Context7 API key: " CONTEXT7_API_KEY
fi

if [ -z "$CONTEXT7_API_KEY" ]; then
  echo "Error: Context7 API key is required"
  exit 1
fi

echo "Testing MCP integration with Context7..."
echo ""

curl -s -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"Look up the Stagehand documentation for the act() method and summarize how to use it\",
    \"integrations\": [
      \"https://mcp.context7.com/mcp?apiKey=$CONTEXT7_API_KEY\"
    ],
    \"maxSteps\": 10
  }" | jq .
