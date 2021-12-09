// Program constants
const GEM_COLORS = [
  '#FFDB3b',
  '#8BC34A',
  '#673AB7',
  '#F43636',
  '#00BCD4',
  '#009688',
  '#F436C5',
  '#FFFF3B',
  '#9C27B0',
  '#FFA800',
  '#3F51B5',
  '#FF5722',
];

const STEP_DURATION = 400;
const STEP_INTERVAL = STEP_DURATION + 250;

// Global variables
let challengeSequence = []; // Current round sequence
let enteredSequence = []; // User-entered steps
let stepQueue = []; // Temp buffer to play sequence
let sequencePlayer = false; // Stores inerval handle
let listeningState = false; // Track game input state

// HTML element selectors
const gems = document.querySelectorAll('.gem');
const board = document.querySelector('#board');

/////// TODO: delete temporary functionality
//

// change to false to turn off debug messages
// const DEBUG = true;

// function log(message) {
//   if (DEBUG) console.log(message);
// }

const testButton = document.querySelector('.test');
testButton.addEventListener('click', () => {
  startRound();
});
//
/////// End temporary functionality

// Event listeners for button styling
// board.addEventListener('mousedown', (event) => {
//   if (event.target.classList.contains('gem')) {
//     // brightenGem(event.target);
//   }
// });
// board.addEventListener('mouseup', (event) => {
//   if (event.target.classList.contains('gem')) {
//     // darkenGem(event.target);
//   }
// });
// board.addEventListener('mouseout', (event) => {
//   if (event.target.classList.contains('gem')) {
//     // darkenGem(event.target);
//   }
// });

// Event listener for user input
board.addEventListener('click', (event) => {
  if (listeningState && event.target.classList.contains('gem')) {
    // Record gem id as int
    recordGemPress(parseInt(event.target.id));
  }
});

/********************
 *  View Functions  *
 ********************/

function brightenGem(gem) {
  gem.classList.add('bright');
}

function darkenGem(gem) {
  gem.classList.remove('bright');
}

function pulseGem(gem) {
  brightenGem(gem);
  // TODO: Play tone
  setTimeout(darkenGem, STEP_DURATION, gem);
}

// TODO: dynamic creation of buttons
gems.forEach((element, i) => {
  element.style.backgroundColor = GEM_COLORS[i];
  element.id = i;
  // element.style.borderColor = GEM_COLORS[i];
});

/********************
 *  Game Functions  *
 ********************/

function resetGame() {
  // Clear states
  challengeSequence = [];
  enteredSequence = [];
  stepQueue = [];
  listeningState = false;
  sequencePlayer = false;

  // TODO: Reshuffle buttons?
}

function addRandomStep() {
  // Generate random number between 0 and # of gems and add to sequence register
  challengeSequence.push(Math.floor(Math.random() * gems.length));
}

function sequenceStepper() {
  // Take one step from queue and pulse the gem
  const nextGem = gems[stepQueue.shift()];
  pulseGem(nextGem);

  // console.log(`${stepQueue.length} steps left`);

  // when queue is empty, clear interval
  if (!stepQueue.length) {
    clearInterval(sequencePlayer);
    sequencePlayer = false;
    readyToListen();
    // console.log('Ready to listen!');
  }
}

function triggerSequence() {
  // Copy steps to a temp buffer
  stepQueue = [...challengeSequence];
  // console.log('Challenge:', stepQueue);

  // Do first step without delay
  sequenceStepper;
  if (stepQueue.length) {
    // Only if there are steps in queue
    // Start iterator
    if (!sequencePlayer) {
      // Prevent setting repeat interval
      sequencePlayer = setInterval(sequenceStepper, STEP_INTERVAL);
    }
  }
}

function recordGemPress(gemId) {
  // Log user-pressed step
  enteredSequence.push(gemId);

  // Current place in sequence
  let step = enteredSequence.length;

  // Check if user sequence matches computer sequence
  if (challengeSequence[step - 1] !== gemId) {
    // Incorrect step
    // TODO: Replace alert with modal
    alert('Game over!');
    // TODO: flash the gem user missed
    resetGame();
  } else if (step === challengeSequence.length) {
    // Full sequence matched, generate new sequence

    // TODO: do something to notify user he was correct

    startRound();
  }
}

function readyToListen() {
  // Enable input
  listeningState = true;

  // TODO: Notify user it's his turn
}

function startRound() {
  // Disable input
  listeningState = false;
  // Reset user sequence
  enteredSequence = [];

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
