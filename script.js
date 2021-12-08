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

const STEP_DURATION = 350;

// Global variables
let = sequenceSteps = [];

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
  console.log('Gem on');
  setTimeout(darkenGem, STEP_DURATION, gem);
  console.log('Gem off requested');
}

// TODO: dynamic creation of buttons

/********************
 *  Game Functions  *
 ********************/

function addRandomStep() {
  sequenceSteps.push(Math.floor(Math.random() * 16));
}

function playSequence() {
  // LOOP through all elements in sequence
  sequenceSteps.forEach();
  // Brighten button

  // TODO: Play tone
  // long Delay
  // Darken button
  // short delay
  // Generate new step
  // append new step to sequnce array
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
