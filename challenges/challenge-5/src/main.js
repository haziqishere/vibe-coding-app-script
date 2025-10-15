/**
 * Challenge 5 - Hello World Web App
 */

function doGet(e) {
  // Test with inline HTML first
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
          }
          button {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            border-radius: 50px;
            cursor: pointer;
          }
          #message {
            margin-top: 20px;
            font-size: 1.5em;
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Challenge 5 Demo</h1>
          <button onclick="showGreeting()">Say Hello!</button>
          <div id="message"></div>
        </div>
        <script>
          function showGreeting() {
            google.script.run
              .withSuccessHandler(function(greeting) {
                document.getElementById('message').innerHTML = greeting;
              })
              .getGreeting();
          }
        </script>
      </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html)
    .setTitle('Challenge 5 - Hello World')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getGreeting() {
  Logger.log('getGreeting called');
  return 'Hello World! 👋 Welcome to Challenge 5!';
}
