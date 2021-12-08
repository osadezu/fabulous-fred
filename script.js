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

// HTML element selectors
const gems = document.querySelectorAll('.gem');
const board = document.querySelector('#board');

// Buttons event listener
board.addEventListener('click', (event) => {
  if (event.target.classList.contains('gem')) {
    event.target.classList.toggle('bright');
  }
});

// Test colors
gems.forEach((element, i) => {
  element.style.backgroundColor = GEM_COLORS[i];
  element.dataset.gemId = i;
});

// Functions
function playSequence() {
  // LOOP for all elements in sequence
  // Brighten button
  // Play tone (?)
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
