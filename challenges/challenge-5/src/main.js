/**
 * Challenge 5 - Hello World Demo
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Challenge 5')
    .addItem('Say Hello', 'sayHello')
    .addToUi();
}

function sayHello() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Hello World! =K', 'Welcome to Challenge 5!', ui.ButtonSet.OK);
  Logger.log('Hello World button was clicked!');
}
