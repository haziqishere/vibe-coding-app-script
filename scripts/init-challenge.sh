#!/bin/bash
set -e

CHALLENGE=$1
TITLE=$2

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$CHALLENGE" ]; then
    echo -e "${RED}Usage: ./scripts/init-challenge.sh <challenge-number> [title]${NC}"
    echo "Example: ./scripts/init-challenge.sh 1 'Email Validator'"
    exit 1
fi

if [ -z "$TITLE" ]; then
    TITLE="Vibe Challenge $CHALLENGE"
fi

CHALLENGE_DIR="challenges/challenge-$CHALLENGE"

echo -e "${YELLOW}🏗️  Initializing Challenge $CHALLENGE...${NC}"

# Create directory structure if it doesn't exist
mkdir -p "$CHALLENGE_DIR/src"

# Navigate to challenge directory
cd "$CHALLENGE_DIR"

# Check if .clasp.json already exists with a valid Script ID
if [ -f ".clasp.json" ]; then
    EXISTING_ID=$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+' || echo "")
    if [ -n "$EXISTING_ID" ] && [ "$EXISTING_ID" != "" ]; then
        echo -e "${YELLOW}⚠️  Challenge $CHALLENGE already has a Script ID: $EXISTING_ID${NC}"
        echo -e "${YELLOW}Skipping clasp create. To recreate, delete .clasp.json first.${NC}"
        SCRIPT_ID=$EXISTING_ID
    else
        # Empty scriptId, need to create
        rm -f .clasp.json
        echo -e "${YELLOW}Creating Apps Script project...${NC}"
        clasp create --title "$TITLE" --type standalone
        SCRIPT_ID=$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+')
    fi
else
    # No .clasp.json, create new project
    echo -e "${YELLOW}Creating Apps Script project...${NC}"
    clasp create --title "$TITLE" --type standalone
    SCRIPT_ID=$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+')
fi

# Verify we got a Script ID
if [ -z "$SCRIPT_ID" ]; then
    echo -e "${RED}❌ Failed to get Script ID${NC}"
    echo -e "${RED}Please check if clasp is logged in: clasp login${NC}"
    exit 1
fi

# Update .clasp.json to use src directory
cat > .clasp.json << EOF
{
  "scriptId": "$SCRIPT_ID",
  "rootDir": "./src"
}
EOF

echo -e "${GREEN}✅ Script ID: $SCRIPT_ID${NC}"

# Create initial main.js if it doesn't exist
if [ ! -f "src/main.js" ]; then
    cat > src/main.js << 'EOF'
/**
 * Challenge Entry Point
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Challenge Menu')
    .addItem('Run Main Function', 'main')
    .addToUi();
}

function main() {
  try {
    Logger.log('Challenge started');
    
    // Your code here
    
    SpreadsheetApp.getUi().alert('Success!');
  } catch (error) {
    Logger.log('Error: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}
EOF
    echo -e "${GREEN}✅ Created src/main.js${NC}"
fi

# Create appsscript.json if it doesn't exist
if [ ! -f "appsscript.json" ]; then
    cat > appsscript.json << 'EOF'
{
  "timeZone": "Asia/Kuala_Lumpur",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
EOF
    echo -e "${GREEN}✅ Created appsscript.json${NC}"
fi

# Create or update README
cat > README.md << EOF
# Challenge $CHALLENGE: $TITLE

## Description
[Add challenge description here]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Implementation Status
- [ ] Basic structure
- [ ] Core functionality
- [ ] Error handling
- [ ] Testing
- [ ] Documentation

## Functions
- \`main()\` - Main entry point
- [Add more functions as you build]

## Apps Script URL
https://script.google.com/d/$SCRIPT_ID/edit

## Local Development
\`\`\`bash
cd challenges/challenge-$CHALLENGE

# Push changes
clasp push

# View logs  
clasp logs

# Open in browser
clasp open
\`\`\`
EOF
echo -e "${GREEN}✅ Created/Updated README.md${NC}"

# Test push to verify everything works
echo -e "${YELLOW}Testing deployment...${NC}"
if clasp push -f; then
    echo -e "${GREEN}✅ Initial deployment successful!${NC}"
else
    echo -e "${RED}⚠️  Deployment test failed, but setup is complete${NC}"
fi

cd ../..

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Challenge $CHALLENGE initialized successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📁 Location:${NC} $CHALLENGE_DIR"
echo -e "${YELLOW}📝 Edit:${NC} $CHALLENGE_DIR/src/main.js"
echo -e "${YELLOW}🔗 Apps Script:${NC} https://script.google.com/d/$SCRIPT_ID/edit"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. cd $CHALLENGE_DIR"
echo "  2. Edit src/main.js"
echo "  3. clasp push"
echo "  4. clasp open (to view in browser)"