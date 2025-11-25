#!/bin/bash

# Test the browserbase-agent worker locally
# Make sure to run: npm run dev first

# Basic test
echo "=== Basic Test ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to google.com and search for Stagehand browser automation",
    "url": "https://google.com",
    "maxSteps": 15
  }' | jq .

# Test with context (additional info for the agent)
echo -e "\n=== Test with Context ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Find the pricing page",
    "url": "https://example.com",
    "context": "This is a SaaS company website. The pricing page is usually in the main navigation.",
    "maxSteps": 10
  }' | jq .

# Test with variables (sensitive data not sent to LLM)
echo -e "\n=== Test with Variables (for login) ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Login with username %username% and password %password%",
    "url": "https://example.com/login",
    "variables": {
      "username": "testuser@example.com",
      "password": "secretpassword123"
    },
    "maxSteps": 10
  }' | jq .

# Test with iframe support (for embedded content)
echo -e "\n=== Test with iframe Support ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Fill out the embedded form",
    "url": "https://example.com/embed-form",
    "iframes": true,
    "domSettleTimeoutMs": 5000,
    "maxSteps": 15
  }' | jq .

# Test with wait between actions (rate-limited sites)
echo -e "\n=== Test with Wait Between Actions ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Navigate through the product catalog",
    "url": "https://example.com/products",
    "waitBetweenActions": 1000,
    "maxSteps": 10
  }' | jq .

# Test with specific model
echo -e "\n=== Test with Specific Model ==="
curl -s -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Extract the main headline",
    "url": "https://example.com",
    "model": "openai/gpt-4.1",
    "maxSteps": 5
  }' | jq .
