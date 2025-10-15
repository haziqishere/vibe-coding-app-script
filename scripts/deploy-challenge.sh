#!/bin/bash
set -e

CHALLENGE=$1

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$CHALLENGE" ]; then
    echo -e "${RED}Usage: ./scripts/deploy-challenge.sh <challenge-number>${NC}"
    echo "Example: ./scripts/deploy-challenge.sh 1"
    exit 1
fi

CHALLENGE_DIR="challenges/challenge-$CHALLENGE"

if [ ! -d "$CHALLENGE_DIR" ]; then
    echo -e "${RED}❌ Challenge $CHALLENGE not found${NC}"
    echo "Available challenges:"
    ls -d challenges/challenge-* | grep -oP 'challenge-\K\d+'
    exit 1
fi

echo -e "${YELLOW}📦 Preparing Challenge $CHALLENGE for deployment...${NC}"

# Copy shared utilities
if [ -d "shared/utils" ]; then
    echo "Copying shared utilities..."
    mkdir -p "$CHALLENGE_DIR/src/shared"
    cp -r shared/utils/* "$CHALLENGE_DIR/src/shared/" 2>/dev/null || true
fi

# Navigate to challenge directory
cd "$CHALLENGE_DIR"

# Validate .clasp.json exists
if [ ! -f ".clasp.json" ]; then
    echo -e "${RED}❌ .clasp.json not found${NC}"
    echo "Run 'clasp create' first or initialize the challenge"
    exit 1
fi

echo -e "${YELLOW}🚀 Deploying Challenge $CHALLENGE...${NC}"

# Push code
clasp push -f

# Deploy
DEPLOY_OUTPUT=$(clasp deploy --description "Challenge $CHALLENGE - Local deploy $(date +%Y-%m-%d_%H:%M:%S)")

echo "$DEPLOY_OUTPUT"

echo -e "${GREEN}✅ Challenge $CHALLENGE deployed successfully!${NC}"

# Show deployment URL
SCRIPT_ID=$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+')
echo -e "${GREEN}🔗 Apps Script URL: https://script.google.com/d/$SCRIPT_ID/edit${NC}"