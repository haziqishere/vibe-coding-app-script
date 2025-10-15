/**
 * Challenge 5 - Hello World Web App
 */

function doGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Challenge 5 - Hello World')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return HtmlService.createHtmlOutput('<h1>Error: ' + error.message + '</h1>');
  }
}

function getGreeting() {
  Logger.log('getGreeting called');
  return 'Hello World! 👋 Welcome to Challenge 5!';
}
