#!/bin/bash

# Test the browserbase-agent worker at deployed URL
WORKER_URL="https://browserbase-agent.ap-a98.workers.dev"

echo "Testing deployed worker at: $WORKER_URL"
echo ""

# Simple extraction test
echo "=== Test 1: Extract Page Title ==="
curl -s -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the main heading on this page?",
    "url": "https://example.com",
    "maxSteps": 3
  }' | jq .

echo -e "\n=== Test 2: Click a Link ==="
curl -s -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Click the More information link",
    "url": "https://example.com",
    "maxSteps": 5
  }' | jq .

echo -e "\n=== Test 3: Navigate and Extract ==="
curl -s -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to the docs page and tell me what the first section is called",
    "url": "https://stagehand.dev",
    "maxSteps": 8
  }' | jq .

echo -e "\n=== Test 4: Simple Search (DuckDuckGo) ==="
curl -s -X POST "$WORKER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Search for browser automation",
    "url": "https://duckduckgo.com",
    "maxSteps": 8
  }' | jq .
