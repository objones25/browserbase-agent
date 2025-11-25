#!/bin/bash

# Test script for logging into a website and performing actions
# This script uses the variable substitution feature for secure credential handling

echo "========================================"
echo "Browser Agent Login Test"
echo "========================================"
echo ""
echo "This script will test the agent's ability to log into Amazon"
echo "and add a product to cart using your credentials."
echo ""
echo "NOTE: Your credentials are substituted client-side and never sent to the LLM."
echo ""

# Prompt for credentials
read -p "Enter your Amazon email: " EMAIL
read -sp "Enter your Amazon password: " PASSWORD
echo ""
read -p "Enter a product name to search for and add to cart: " PRODUCT
echo ""

# Confirm before proceeding
echo ""
echo "Ready to test with:"
echo "  Email: $EMAIL"
echo "  Product: $PRODUCT"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "Starting agent..."
echo ""

# Make the request with streaming
curl -N -X POST https://browserbase-agent.ap-a98.workers.dev \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"Go to Amazon.com, log in with email %email% and password %password%, search for '%product%', click on the first result, and add it to cart. Confirm the item was added to cart.\",
    \"url\": \"https://www.amazon.com\",
    \"maxSteps\": 25,
    \"variables\": {
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\",
      \"product\": \"$PRODUCT\"
    },
    \"stream\": true,
    \"domSettleTimeoutMs\": 3000,
    \"waitBetweenActions\": 1000
  }"

echo ""
echo ""
echo "========================================"
echo "Test complete"
echo "========================================"
