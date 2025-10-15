# Coding Conventions

## File Naming
- Use kebab-case for files: `user-service.js`, `data-validator.js`
- Main entry point: always `main.js`

## Function Naming
```javascript
// ✅ Good
function processUserData() { }
function validateEmail() { }
function onFormSubmit() { }

// ❌ Bad
function Process_User_Data() { }
function validate_email() { }
```

## Error Handling Pattern
Always use this pattern:
```javascript
function myFunction() {
  try {
    // Your logic here
    
  } catch (error) {
    Logger.log(`Error in myFunction: ${error.message}`);
    Logger.log(error.stack);
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    throw error; // Re-throw if you want calling function to handle
  }
}
```

## JSDoc Comments
Required for all public functions:
```javascript
/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} True if valid, false otherwise
 * @throws {Error} If email parameter is not a string
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }
  // validation logic
}
```

## Shared Code Usage
When using shared utilities:
```javascript
// Import pattern (Apps Script auto-includes all files)
// Just call directly:
const isValid = validateEmail(userEmail); // from shared/utils/validation.js
```

## Constants
```javascript
// At top of file
const MAX_RETRIES = 3;
const API_ENDPOINT = 'https://api.example.com';
const SHEET_NAME = 'Data';
```

## Apps Script Specific

### Get Active Spreadsheet
```javascript
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName('Sheet1');
```

### Properties Service (for config)
```javascript
// Set (via Script Properties in UI)
const CONFIG = PropertiesService.getScriptProperties();
const apiKey = CONFIG.getProperty('API_KEY');
```

### Rate Limiting Awareness
```javascript
// Apps Script has quotas - batch operations when possible
const values = sheet.getRange('A1:A100').getValues(); // ✅ One call
// vs
for (let i = 1; i <= 100; i++) {
  const value = sheet.getRange(`A${i}`).getValue(); // ❌ 100 calls
}
```