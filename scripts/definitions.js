// Game States
class GameState {
  static Ready = new GameState('ready');
  static Showing = new GameState('showing');
  static Listening = new GameState('listening');
  static Configuring = new GameState('configuring');
  static Lost = new GameState('lost');

  constructor(state) {
    this.state = state;
  }
}
