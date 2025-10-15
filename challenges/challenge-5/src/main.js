/**
 * Challenge 5 - Hello World Web App
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Challenge 5 - Hello World')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getGreeting() {
  Logger.log('getGreeting called');
  return 'Hello World! 👋 Welcome to Challenge 5!';
}
