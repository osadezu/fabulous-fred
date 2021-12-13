/*************************************
 *  Class Definitions and Constants  *
 *************************************/

// Enum for Game States
class State {
  static Idle = new State('idle');
  static Ready = new State('ready');
  static Showing = new State('showing');
  static Listening = new State('listening');
  static Lost = new State('lost');

  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

// Program constants
const GEM_COLORS = [
  '#FFDB3b',
  '#8BC34A',
  '#673AB7',
  '#F43636',
  '#00BCD4',
  '#009688',
  '#F436C5',
  '#FFFF58',
  '#9C27B0',
  '#FFA800',
  '#3F51B5',
  '#FF5722',
];

// Game Default Parameters
const HINTS = 3;
const STEP_DURATION = 400;
const STEP_INTERVAL = STEP_DURATION + 250;
const SHORT_DURATION = 200;
const SHORT_INTERVAL = SHORT_DURATION + 200;

// Game Settings
class Game {
  // TODO: should other game constants be static properties of Game?

  constructor() {
    this.numGems = 12; // Number of buttons (gems) to play with
    this.insaneMode = false; // Buttons move around
    this.hintsLeft = HINTS; // Times user can cheat
    this.sequenceIterator = null; // Stores inerval handle
    this.state = State.Ready; // Keep track of game state
  }

  reset() {
    this.hintsLeft = HINTS;
    this.state = State.Ready;
    clearInterval(this.sequenceIterator); // Clear interval if it exists when reset is hit
    this.sequenceIterator = null; // Stores inerval handle
  }
}
