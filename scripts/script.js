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
const btnPlay = document.querySelector('#play-control');

// Enable Gem user inputs
function enableGemInputs() {
  gameBoard.addEventListener('click', gemEventHandler);
  // Remove disabled style
  btnGems.forEach((btn) => {
    btn.classList.remove('disabled');
  });
}

// Disable Gem user inputs
function disableGemInputs() {
  gameBoard.removeEventListener('click', gemEventHandler);
  // Add disabled style
  btnGems.forEach((btn) => {
    btn.classList.add('disabled');
  });
}

function gemEventHandler(event) {
  if (event.target.classList.contains('gem')) {
    // Record gem id as int
    recordGemPress(parseInt(event.target.id));
  }
}

// Enable changing game settings
function enableControlInputs() {
  controlNumGems.addEventListener('click', controlsEventHandler);
  // Remove disabled style
  btnNumGems.forEach((btn) => {
    btn.classList.remove('disabled');
  });
}

// Disable changing game settings
function disableControlInputs() {
  controlNumGems.removeEventListener('click', controlsEventHandler);
  // Add disabled style
  btnNumGems.forEach((btn) => {
    btn.classList.add('disabled');
  });
}

function controlsEventHandler(event) {
  // If button is not selected
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

// Enable play buttons
function enablePlayInputs() {
  btnPlay.addEventListener('click', gameControlsEventHandler);
  // Remove disabled style
  btnPlay.classList.remove('disabled');
}

// Disable play buttons
function disablePlayInputs() {
  btnPlay.removeEventListener('click', gameControlsEventHandler);
  // Add disabled style
  btnPlay.classList.add('disabled');
}

function gameControlsEventHandler(event) {
  // If button is not selected (disabled)
  if (game.state === State.Ready) {
    startRound();
  } else if (game.state === State.Listening) {
    takeHint();
  } else if (game.state === State.Idle) {
    resetGame();
    startRound();
  }
}

// Reset button is always active
btnReset.addEventListener('click', resetGame);

// Event listener to init game after load
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

function flashGem(gem, duration) {
  brightenGem(gem);
  // TODO: Play tone?
  setTimeout(darkenGem, duration, gem);
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
  // Update Control Inputs (numGem) button styling
  btnNumGems.forEach((btn) => {
    if (parseInt(btn.dataset.numGems) === game.numGems) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Control inputs enabled/disabled status
  if (game.state === State.Showing || game.state === State.Listening) {
    disableControlInputs();
  } else {
    enableControlInputs();
  }

  // Play button Text
  if (game.state === State.Ready) {
    // Game hasn't started
    btnPlay.innerText = 'Play!';
  } else if (game.hintsLeft > 0 && game.state !== State.Idle) {
    // During play, show how many hints are left
    btnPlay.innerText = `Cheat [${game.hintsLeft}]`;
  } else if (game.state !== State.Idle) {
    // No hints left, disable button
    btnPlay.innerText = '¯\\_(ツ)_/¯';
  } else {
    // If game over
    btnPlay.innerText = 'Play again!';
  }

  // Play button enabled/disabled status
  if (game.state === State.Showing) {
    disablePlayInputs();
  } else if (game.hintsLeft === 0 && game.state !== State.Idle) {
    disablePlayInputs();
  } else {
    enablePlayInputs();
  }

  // Control gem buttons enabled/disabled status
  if (game.state === State.Showing) {
    disableGemInputs();
  } else {
    enableGemInputs();
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
}

function addRandomStep() {
  // Generate random number between 0 and # of gems and add to sequence register
  challengeSequence.push(Math.floor(Math.random() * btnGems.length));
}

function sequenceDone() {
  if (game.state === State.Showing) {
    // Normal play
    readyToListen();
  } else if (game.state === State.Lost) {
    // After incorrect sequence
    lose();
  }
}

function sequenceStepper(stepDuration) {
  // Take one step from queue and pulse the gem
  const nextStep = stepQueue.shift();

  // Trigger flash if nextStep is not null
  if (nextStep !== null) {
    const nextGem = btnGems[nextStep];
    flashGem(nextGem, stepDuration);
  } else {
    // Null read, end iterator
    clearInterval(game.sequenceIterator);
    game.sequenceIterator = null;
    sequenceDone();
  }
}

// Trigger flashing sequence
// If no sequence is given, trigger main play sequence
function triggerSequence(
  sequence = challengeSequence,
  interval = STEP_INTERVAL,
  duration = STEP_DURATION
) {
  // Copy steps to a temp buffer
  stepQueue = [...sequence];

  // Append null element to indicate end of sequence
  // Final interval while flashing ends
  stepQueue.push(null);

  if (!game.sequenceIterator) {
    // Start iterator
    game.sequenceIterator = setInterval(sequenceStepper, interval, duration);
  }
}

function recordGemPress(gemId) {
  if (game.state !== State.Listening) {
    return; // Do nothing
  }
  // Log user-pressed step
  enteredSequence.push(gemId);

  // Current place in sequence
  const step = enteredSequence.length;

  // Check if user sequence matches computer sequence
  if (challengeSequence[step - 1] !== gemId) {
    // Incorrect step entered

    // Set game state
    game.state = State.Lost;

    // Flash incorrect step, then game over
    incorrectStep(challengeSequence[step - 1]);
  } else if (step === challengeSequence.length) {
    // Full sequence matched

    // TODO: do something to notify user he was correct
    display.value = 'GREAT!';

    // Continue to next round
    startRound();
  }
}

function incorrectStep(gemId) {
  // Flash missed gem
  const gameOverSequence = [gemId, gemId, gemId];
  triggerSequence(gameOverSequence, SHORT_INTERVAL, SHORT_DURATION);
}

function lose() {
  // Set game state
  game.state = State.Idle;

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
  // enableGemInputs();
  refreshControls();

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
  // disableGemInputs();
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

// TODO: imrpove intervals and display sequence completion with Promise delay chain?
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
