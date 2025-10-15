#!/bin/bash
set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying all challenges...${NC}"
echo ""

DEPLOYED=0
FAILED=0

for i in {1..5}; do
    if [ -d "challenges/challenge-$i" ]; then
        echo -e "${YELLOW}--- Challenge $i ---${NC}"
        if ./scripts/deploy-challenge.sh $i; then
            ((DEPLOYED++))
        else
            ((FAILED++))
        fi
        echo ""
    fi
done

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Summary${NC}"
echo -e "${GREEN}✅ Deployed: $DEPLOYED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
fi
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━${NC}"