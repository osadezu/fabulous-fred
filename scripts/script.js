// Global variables
let challengeSequence = []; // Current round sequence
let enteredSequence = []; // User-entered steps
let stepQueue = []; // Temp buffer to play sequence
let listeningState = false; // Track game input state

let game = new Game();

/**************************
 *  DOM object selectors  *
 **************************/

// Containers
const gameBoard = document.querySelector('#board');
const controlNumGems = document.querySelector('#num-gems');

// Display
const display = document.querySelector('.lcd');

// Buttons
let btnGems = []; // Created dynamically
const btnNumGems = document.querySelectorAll('#num-gems > .control-btn');
const btnReset = document.querySelector('#reset > .control-btn');
const btnPlay = document.querySelector('#play > .control-btn');

// Enable or disable Gem user inputs
function enableGemInputs() {
  gameBoard.addEventListener('click', gemEventHandler);
  // TODO: Change CSS class to enable :hover and :active
}
function disableGemInputs() {
  gameBoard.removeEventListener('click', gemEventHandler);
  // TODO: Change CSS class to disable :hover and :active
}

function gemEventHandler(event) {
  if (event.target.classList.contains('gem')) {
    // Record gem id as int
    recordGemPress(parseInt(event.target.id));
  }
}

// Enable or disable changing game settings
function enableControlInputs() {
  controlNumGems.addEventListener('click', controlsEventHandler);
  // TODO: Change CSS class to enable :hover and :active
}
function disableControlInputs() {
  controlNumGems.removeEventListener('click', controlsEventHandler);
  // TODO: Change CSS class to disable :hover and :active
}

function controlsEventHandler(event) {
  // If button is not selected (disabled)
  if (
    !event.target.classList.contains('selected') &&
    event.target.classList.contains('control-btn')
  ) {
    // Change difficulty number of gems and generate buttons
    game.numGems = parseInt(event.target.dataset.numGems);
    // Rebuild
    resetGame();
  }
}

// Enable or disable play buttons
function enablePlayInputs() {
  btnPlay.addEventListener('click', gameControlsEventHandler);
  // TODO: Change CSS class to enable :hover and :active
}
function disablePlayInputs() {
  btnPlay.removeEventListener('click', gameControlsEventHandler);
  // TODO: Change CSS class to disable :hover and :active
}

function gameControlsEventHandler(event) {
  // If button is not selected (disabled)
  if (game.state === State.Ready) {
    startRound();
  } else if (game.state === State.Listening) {
    takeHint();
  } // else: ran out of hints, do nothing
}

// Reset button is always active
btnReset.addEventListener('click', resetGame);

// Event listener to start game after load
document.addEventListener('DOMContentLoaded', resetGame);

/********************
 *  View Functions  *
 ********************/

function brightenGem(gem) {
  gem.classList.add('bright');
}

function darkenGem(gem) {
  gem.classList.remove('bright');
}

function flashGem(gem) {
  brightenGem(gem);
  // TODO: Play tone?
  setTimeout(darkenGem, STEP_DURATION, gem);
}

// Dynamic creation of buttons
function createGems() {
  // Flush existing buttons
  while (btnGems.length) {
    btnGems.pop().remove();
  }

  // Set grid styling
  gameBoard.classList = `num-gems-${game.numGems}`;

  // Create new buttons
  for (let i = 0; i < game.numGems; i++) {
    // Create gem button
    const gem = document.createElement('button');
    gem.classList.add('gem');
    gem.style.backgroundColor = GEM_COLORS[i];
    gem.id = i;

    // Add gem to game board element
    gameBoard.appendChild(gem);

    // gem.style.borderColor = GEM_COLORS[i];
    btnGems.push(gem);
  }
}

// Refresh control button displayed state
function refreshControls() {
  // Update button styling
  btnNumGems.forEach((btn) => {
    if (parseInt(btn.dataset.numGems) === game.numGems) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Play button
  if (game.state === State.Ready) {
    // Game hasn't started
    btnPlay.innerText = 'Play!';
    btnPlay.classList.remove('selected');
  } else if (game.hintsLeft > 0 && game.state !== State.Lost) {
    // During play, show how many hints are left
    btnPlay.innerText = `Cheat [${game.hintsLeft}]`;
  } else {
    // No hints left, disable button
    btnPlay.innerText = '¯\\_(ツ)_/¯';
    btnPlay.classList.add('selected');
  }
}

// /********************
//  *  Game Functions  *
//  ********************/

function resetGame() {
  // Clear states
  challengeSequence = [];
  enteredSequence = [];
  stepQueue = [];

  // Reset defaults
  game.reset();

  // Generate gameBoard buttons
  createGems();

  // TODO: move this to a display handling function
  display.value = 'HELLO!';

  // Set main state game
  game.state = State.Ready;

  // Refresh controls display
  refreshControls();
  enableControlInputs();
  enablePlayInputs();
}

function addRandomStep() {
  // Generate random number between 0 and # of gems and add to sequence register
  challengeSequence.push(Math.floor(Math.random() * btnGems.length));
}

function sequenceStepper() {
  // Take one step from queue and pulse the gem
  const nextGem = btnGems[stepQueue.shift()];
  flashGem(nextGem);

  // when queue is empty, clear interval
  if (!stepQueue.length) {
    clearInterval(game.sequenceIterator);
    game.sequenceIterator = null;
    readyToListen();
  }
}

function triggerSequence() {
  // Copy steps to a temp buffer
  stepQueue = [...challengeSequence];

  if (!game.sequenceIterator) {
    // Start iterator
    game.sequenceIterator = setInterval(sequenceStepper, STEP_INTERVAL);
  }
}

function recordGemPress(gemId) {
  // Log user-pressed step
  enteredSequence.push(gemId);

  // Current place in sequence
  const step = enteredSequence.length;

  // Check if user sequence matches computer sequence
  if (challengeSequence[step - 1] !== gemId) {
    // Incorrect step, game over
    lose();
  } else if (step === challengeSequence.length) {
    // Full sequence matched

    // TODO: do something to notify user he was correct
    display.value = 'GREAT!';

    // Continue to next round
    startRound();
  }
}

function lose() {
  // Set game state
  game.state = State.Lost;

  // Disable game buttons
  disableGemInputs();

  // TODO: flash the gem user missed

  // Stop listening
  display.value = 'GAME OVER!';

  refreshControls();
}

function readyToListen() {
  // Set game state
  game.state = State.Listening;

  // Reset user sequence
  enteredSequence = [];

  // Enable game buttons
  enableGemInputs();
  enablePlayInputs();

  // Display text
  display.value = `GIVE ME ${challengeSequence.length}!`;
}

function takeHint() {
  // Decrement hints counter
  game.hintsLeft--;
  refreshControls();

  startRound();
}

function startRound() {
  // Set game state
  game.state = State.Showing;

  // Disable inputs
  disableGemInputs();
  disableControlInputs();
  disablePlayInputs();
  refreshControls();

  // TODO: Move all Display text to a single display handler function
  if (challengeSequence.length < 1) {
    display.value = "LET'S GO!";
  } else if (challengeSequence.length % 3 === 0) {
    display.value = "LET'S SEE...";
  }

  // Add a step to the sequence queue
  addRandomStep();
  // Trigger sequence
  triggerSequence();
}

// TODO: imrpove interval with Promise delay chain?
/*
// https://stackoverflow.com/questions/41079410/delays-between-promises-in-promise-chain
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let parameterArr = ['a', 'b', 'c', 'd', 'e', 'f'];

parameterArr.reduce(function (promise, item) {
  return promise.then(function (result) {
    return Promise.all([delay(50), myPromise(item)]);
  });
}, Promise.resolve());

 */
