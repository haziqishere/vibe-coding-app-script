#!/bin/bash
set -e

CHALLENGE=$1
TITLE=$2

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$CHALLENGE" ]; then
    echo "Usage: ./scripts/init-challenge.sh <challenge-number> [title]"
    echo "Example: ./scripts/init-challenge.sh 1 'Email Validator'"
    exit 1
fi

if [ -z "$TITLE" ]; then
    TITLE="Vibe Challenge $CHALLENGE"
fi

CHALLENGE_DIR="challenges/challenge-$CHALLENGE"

echo -e "${YELLOW}🏗️  Initializing Challenge $CHALLENGE...${NC}"

# Create directory structure
mkdir -p "$CHALLENGE_DIR/src"

# Create Apps Script project
cd "$CHALLENGE_DIR"
clasp create --title "$TITLE" --type standalone

# Create initial main.js
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

# Update .clasp.json to use src directory
cat > .clasp.json << EOF
{
  "scriptId": "$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+')",
  "rootDir": "./src"
}
EOF

# Create README
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
https://script.google.com/d/$(cat .clasp.json | grep -oP '(?<="scriptId":")[^"]+')/edit
EOF

echo -e "${GREEN}✅ Challenge $CHALLENGE initialized!${NC}"
echo -e "${GREEN}📁 Location: $CHALLENGE_DIR${NC}"
echo -e "${GREEN}📝 Edit: $CHALLENGE_DIR/src/main.js${NC}"