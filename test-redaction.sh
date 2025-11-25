#!/bin/bash

curl -N -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Navigate to example.com and type my email %email% and password %password%",
    "url": "https://example.com",
    "maxSteps": 5,
    "variables": {
      "email": "test@example.com",
      "password": "secretpassword123"
    },
    "stream": true
  }'
