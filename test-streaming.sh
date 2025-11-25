#!/bin/bash

# Test script to verify streaming functionality
# This will test the streaming SSE endpoint

echo "Testing streaming response..."
echo ""

curl -N -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Go to example.com and tell me what you see",
    "url": "https://example.com",
    "maxSteps": 5,
    "stream": true
  }'

echo ""
echo ""
echo "Stream test complete!"
