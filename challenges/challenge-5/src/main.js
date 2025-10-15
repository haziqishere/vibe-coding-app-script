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
