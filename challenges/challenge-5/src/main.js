/**
 * Challenge 5 - Hello World Web App
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Challenge 5 - Hello World')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getGreeting() {
  Logger.log('getGreeting called');
  return 'Hello World! 👋 Welcome to Challenge 5!';
}
