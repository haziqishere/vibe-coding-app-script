/**
 * Common utilities shared across all challenges
 */

/**
 * Formats a date to YYYY-MM-DD format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Validates email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gets the active sheet safely with error handling
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} Active sheet
 * @throws {Error} If no active spreadsheet
 */
function getActiveSheetSafe() {
  try {
    return SpreadsheetApp.getActiveSheet();
  } catch (error) {
    throw new Error('No active spreadsheet found. Make sure script is bound to a spreadsheet.');
  }
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} title - Toast title (optional)
 */
function showToast(message, title = 'Notification') {
  SpreadsheetApp.getActive().toast(message, title, 3);
}