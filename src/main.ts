import { Game } from './Game';

// Initialize and start the game
const container = document.getElementById('game-container');
if (!container) {
  throw new Error('Game container not found');
}

const game = new Game(container);
game.start();
