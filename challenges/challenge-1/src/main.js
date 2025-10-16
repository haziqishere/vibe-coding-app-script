/**
 * A client-side function that processes a list of options and returns a single random choice.
 *
 * @param {string[]} options - An array of strings representing the choices.
 * @return {{choice: string, index: number}} An object containing the chosen option and its index.
 */
function makeDecision(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return { choice: "No options available.", index: -1 };
  }
  const chosenIndex = Math.floor(Math.random() * options.length);
  return { choice: options[chosenIndex], index: chosenIndex };
}

// --- State Management ---
let username = '';
let options = [];

// --- DOM Element Selectors ---
const screens = {
    welcome: document.getElementById('welcomeScreen'),
    input: document.getElementById('inputScreen'),
    spinner: document.getElementById('spinnerScreen'),
    result: document.getElementById('resultScreen'),
};
const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');
const inputGreeting = document.getElementById('input-greeting');
const optionInput = document.getElementById('optionInput');
const addOptionBtn = document.getElementById('addOptionBtn');
const optionsList = document.getElementById('options-list');
const decideBtn = document.getElementById('decideBtn');
const wheelContainer = document.getElementById('wheel-container');
const resultText = document.getElementById('resultText');
const startOverBtn = document.getElementById('startOverBtn');
const confettiCanvas = document.getElementById('confetti-canvas');
const myConfetti = confetti.create(confettiCanvas, { resize: true });

// --- UI Navigation ---
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenId].classList.add('active');
}

// --- Core App Functions ---

/**
 * Validates username and transitions to the input screen.
 */
function startApp() {
    username = usernameInput.value.trim();
    if (!username) {
        alert("Please enter your name!");
        return;
    }
    inputGreeting.textContent = `Alright ${username}, what are the choices?`;
    showScreen('input');
}

/**
 * Adds a new option to the state and re-renders the list.
 */
function addOption() {
    const optionValue = optionInput.value.trim();
    if (optionValue) {
        options.push(optionValue);
        optionInput.value = '';
        renderOptions();
    }
    optionInput.focus();
}

/**
 * Removes an option from the state by its index and re-renders.
 * @param {number} index - The index of the option to remove.
 */
function removeOption(index) {
    options.splice(index, 1);
    renderOptions();
}

/**
 * Renders the list of options and updates the "Decide" button state.
 */
function renderOptions() {
    optionsList.innerHTML = '';
    options.forEach((option, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span></span><button class="remove-btn">&times;</button>`;
        li.querySelector('span').textContent = option; // Safely set text content
        li.querySelector('.remove-btn').addEventListener('click', () => removeOption(index));
        optionsList.appendChild(li);
    });
    decideBtn.disabled = options.length < 2;
}

/**
 * Starts the decision process, builds the wheel, and shows the spinner.
 */
function getDecision() {
    if (options.length < 2) {
        alert("Please add at least two options!");
        return;
    }
    decideBtn.disabled = true;
    decideBtn.textContent = "Thinking...";
    
    const { choice, index } = makeDecision(options);
    
    buildAndSpinWheel(options, index);
    showScreen('spinner');
    
    // This now replaces the google.script.run call.
    // We wait for the wheel animation (4s) + a little buffer (0.5s) to finish.
    setTimeout(() => showResult(choice), 4500);
}

/**
 * Displays the final result with a confetti celebration.
 * @param {string} chosenOption - The winning option.
 */
function showResult(chosenOption) {
    resultText.innerHTML = `<p>${username}, the choice has been made:</p><div class="chosen-option"></div>`;
    resultText.querySelector('.chosen-option').textContent = chosenOption; // Safely set text
    showScreen('result');
    myConfetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
}

/**
 * Resets the application state to allow for a new decision.
 */
function startOver() {
    options = [];
    renderOptions();
    decideBtn.textContent = "Decide For Me!";
    showScreen('input');
}

/**
 * Builds an SVG spinning wheel and animates it to the chosen result.
 * @param {string[]} wheelOptions - The list of options to display on the wheel.
 * @param {number} chosenIndex - The index of the winning option.
 */
function buildAndSpinWheel(wheelOptions, chosenIndex) {
    wheelContainer.innerHTML = '';
    
    const colors = ['#075E54', '#128C7E', '#25D366', '#34B7F1', '#0b4d46'];
    const numOptions = wheelOptions.length;
    const anglePerSlice = 360 / numOptions;
    const size = 250;
    const center = size / 2;

    let svgMarkup = `<svg id="wheel-svg" class="wheel-svg" viewBox="0 0 ${size} ${size}">`;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };
    
    for (let i = 0; i < numOptions; i++) {
        const startAngle = i * anglePerSlice;
        const endAngle = startAngle + anglePerSlice;
        const color = colors[i % colors.length];

        const start = polarToCartesian(center, center, center, endAngle);
        const end = polarToCartesian(center, center, center, startAngle);
        const largeArcFlag = anglePerSlice <= 180 ? "0" : "1";
        const d = `M ${start.x} ${start.y} A ${center} ${center} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${center} ${center} Z`;
        svgMarkup += `<path d="${d}" fill="${color}" />`;

        const textRadius = center * 0.7;
        const textPathId = `textPath${i}`;
        const textArcStart = polarToCartesian(center, center, textRadius, endAngle - anglePerSlice * 0.1);
        const textArcEnd = polarToCartesian(center, center, textRadius, startAngle + anglePerSlice * 0.1);
        const textD = `M ${textArcStart.x} ${textArcStart.y} A ${textRadius} ${textRadius} 0 0 1 ${textArcEnd.x} ${textArcEnd.y}`;
        svgMarkup += `<defs><path id="${textPathId}" d="${textD}" /></defs>`;

        const text = wheelOptions[i].length > 15 ? wheelOptions[i].substring(0, 12) + '...' : wheelOptions[i];
        svgMarkup += `<text><textPath href="#${textPathId}" startOffset="50%">${text}</textPath></text>`;
    }

    svgMarkup += `</svg>`;
    wheelContainer.innerHTML = svgMarkup;
    const wheelSvg = document.getElementById('wheel-svg');

    const randomSpins = Math.floor(Math.random() * 4) + 5; // 5 to 8 full spins
    const stopAngle = (chosenIndex * anglePerSlice) + (anglePerSlice / 2);
    // Add a small random offset within the winning slice to make it less predictable
    const randomOffset = (Math.random() - 0.5) * (anglePerSlice * 0.6);
    const finalRotation = (randomSpins * 360) + (360 - stopAngle - randomOffset);
    
    setTimeout(() => { wheelSvg.style.transform = `rotate(${finalRotation}deg)`; }, 100);
}

// --- Event Listeners Setup ---
startBtn.addEventListener('click', startApp);
addOptionBtn.addEventListener('click', addOption);
optionInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') addOption(); });
decideBtn.addEventListener('click', getDecision);
startOverBtn.addEventListener('click', startOver);
usernameInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') startApp(); });

// --- Initial Render ---
renderOptions();