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
let sequenceSteps = []; // current round sequence
let stepQueue = []; // Temp buffer to play sequence
let sequencePlayer = null; // Stores inerval handle

// HTML element selectors
const gems = document.querySelectorAll('.gem');
const board = document.querySelector('#board');

// Event listeners
board.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('gem')) {
    brightenGem(event.target);
  }
});
board.addEventListener('mouseup', (event) => {
  if (event.target.classList.contains('gem')) {
    darkenGem(event.target);
  }
});
board.addEventListener('mouseout', (event) => {
  if (event.target.classList.contains('gem')) {
    darkenGem(event.target);
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

/********************
 *  Game Functions  *
 ********************/

function addRandomStep() {
  sequenceSteps.push(Math.floor(Math.random() * 16));
}

function sequenceStepper() {
  // Take one step from queue and pulse the gem
  const nextGem = gems[stepQueue.shift()];
  pulseGem(nextGem);

  // console.log(`${stepQueue.length} steps left`);

  // when queue is empty, clear interval
  if (!stepQueue.length) {
    clearInterval(sequencePlayer);
    // console.log('cleared interval');
  }
}

function triggerSequence() {
  // Copy steps to a temp buffer
  stepQueue = [...sequenceSteps];
  console.log('queue is now:', stepQueue);

  // Start iterator
  sequencePlayer = setInterval(sequenceStepper, STEP_INTERVAL);
}

function listenForSequence() {
  // compare current input with first step of sequence
  // if incorrect > lose round
  // if correct, advance step in sequence and listen for next step
}

// TODO: Below code is for tests, bake into final functionality

// Test colors
gems.forEach((element, i) => {
  element.style.backgroundColor = GEM_COLORS[i];
  element.id = i;
});

for (let i = 0; i < 5; i++) {
  addRandomStep();
}
console.log(sequenceSteps);

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
