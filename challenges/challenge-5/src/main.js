/**
 * Challenge 5 - Interactive Web App Demo
 * Now with multiple features: greeting, counter, and motivational quotes!
 */

function doGet(e) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
          }
          h1 {
            color: #764ba2;
            margin-bottom: 30px;
          }
          .feature-section {
            margin: 30px 0;
            padding: 20px;
            border-radius: 10px;
            background: #f8f9fa;
          }
          button {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 5px;
          }
          button:hover {
            background: #764ba2;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          button:active {
            transform: translateY(0);
          }
          .message {
            margin-top: 20px;
            font-size: 1.3em;
            color: #667eea;
            min-height: 30px;
          }
          .counter-display {
            font-size: 3em;
            font-weight: bold;
            color: #764ba2;
            margin: 20px 0;
          }
          .quote-text {
            font-style: italic;
            font-size: 1.2em;
            color: #333;
            margin: 15px 0;
            line-height: 1.6;
          }
          .quote-author {
            color: #667eea;
            font-weight: bold;
          }
          .loading {
            opacity: 0.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Challenge 5 Interactive Demo</h1>

          <div class="feature-section">
            <h2>👋 Greeting</h2>
            <button onclick="showGreeting()">Say Hello!</button>
            <div id="greeting-message" class="message"></div>
          </div>

          <div class="feature-section">
            <h2>🔢 Counter</h2>
            <div id="counter-display" class="counter-display">0</div>
            <button onclick="incrementCounter()">Increment</button>
            <button onclick="decrementCounter()">Decrement</button>
            <button onclick="resetCounter()">Reset</button>
          </div>

          <div class="feature-section">
            <h2>💡 Motivational Quotes</h2>
            <button onclick="getRandomQuote()">Get Inspired!</button>
            <div id="quote-display" class="message">
              <div class="quote-text" id="quote-text"></div>
              <div class="quote-author" id="quote-author"></div>
            </div>
          </div>

          <div class="feature-section">
            <h2>📊 Server Time</h2>
            <button onclick="getServerTime()">Get Server Time</button>
            <div id="time-message" class="message"></div>
          </div>
        </div>

        <script>
          let counter = 0;

          function showGreeting() {
            document.getElementById('greeting-message').className = 'message loading';
            google.script.run
              .withSuccessHandler(function(greeting) {
                document.getElementById('greeting-message').innerHTML = greeting;
                document.getElementById('greeting-message').className = 'message';
              })
              .getGreeting();
          }

          function incrementCounter() {
            counter++;
            updateCounterDisplay();
          }

          function decrementCounter() {
            counter--;
            updateCounterDisplay();
          }

          function resetCounter() {
            counter = 0;
            updateCounterDisplay();
          }

          function updateCounterDisplay() {
            document.getElementById('counter-display').textContent = counter;
          }

          function getRandomQuote() {
            document.getElementById('quote-text').textContent = 'Loading...';
            document.getElementById('quote-author').textContent = '';
            google.script.run
              .withSuccessHandler(function(quote) {
                document.getElementById('quote-text').textContent = '"' + quote.text + '"';
                document.getElementById('quote-author').textContent = '— ' + quote.author;
              })
              .getMotivationalQuote();
          }

          function getServerTime() {
            document.getElementById('time-message').className = 'message loading';
            google.script.run
              .withSuccessHandler(function(timeInfo) {
                document.getElementById('time-message').innerHTML = timeInfo;
                document.getElementById('time-message').className = 'message';
              })
              .getServerTime();
          }
        </script>
      </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html)
    .setTitle('Challenge 5 - Interactive Demo')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getGreeting() {
  Logger.log('getGreeting called');
  const greetings = [
    'Hello World! 👋 Welcome to Challenge 5!',
    'Hey there! 🎉 Great to see you!',
    'Greetings, friend! 🌟 Hope you\'re having an awesome day!',
    'Welcome aboard! 🚀 Let\'s build something amazing!',
    'Hi! 😊 Thanks for trying out this demo!'
  ];

  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

function getMotivationalQuote() {
  Logger.log('getMotivationalQuote called');
  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
    { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
    { text: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
    { text: 'The function of good software is to make the complex appear to be simple.', author: 'Grady Booch' }
  ];

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

function getServerTime() {
  Logger.log('getServerTime called');
  const now = new Date();
  const timeString = now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  return '🕐 Server Time: ' + timeString;
}
