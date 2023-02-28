// @flow

const {config} = require('../config');
const {clamp, subtractWithDeficit} = require('bens_utils').math;
const {randomIn, normalIn, oneOf, weightedOneOf} = require('bens_utils').stochastic;
const {render} = require('../render');
const {getYourBike} = require('../selectors/misc');
const {add, subtract, equals} = require('bens_utils').vectors;


const gameReducer = (game, action) => {
  switch (action.type) {
    case 'SET_DIRECTION': {
      const {direction} = action;
      const bike = getYourBike(game);
      bike.direction = direction;
      console.log("direction set", bike.direction);
      return game;
    }
    case 'START_TICK': {
      if (game != null && game.tickInterval != null) {
        return game;
      }
      game.prevTickTime = new Date().getTime();
      return {
        ...game,
        tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({type: 'TICK'}),
          config.msPerTick,
        ),
      };
    }
    case 'STOP_TICK': {
      clearInterval(game.tickInterval);
      game.tickInterval = null;

      return game;
    }
    case 'TICK': {
      game.time += 1;

      // move each bike
      let didBothLose = false;
      let bikeThatLost = null;
      for (const bike of game.bikes) {
        let didLose = false;
        // move at half speed when not boosting
        if (!bike.isBoosting && game.time % 2 == 1) continue;

        let moveVec = {x: 0, y: 0};
        if (bike.direction == 'left') moveVec.x = -1;
        if (bike.direction == 'right') moveVec.x = 1;
        if (bike.direction == 'up') moveVec.y = 1;
        if (bike.direction == 'down') moveVec.y = -1;

        bike.position = add(bike.position, moveVec);

        // check for whether you're about to go outside the grid
        if (
          bike.position. x < 0 || bike.position.x >= game.worldSize.width ||
          bike.position. y < 0 || bike.position.y >= game.worldSize.height
        ) {
          didLose = true;
          if (bikeThatLost != null) didBothLose = true; // check for ties
          bikeThatLost = bike;
          continue;
        }

        // check whether you just hit someone's trail
        if (game.grid[bike.position.x][bike.position.y] != null) {
          didLose = true;
          if (bikeThatLost != null) didBothLose = true; // check for ties
          bikeThatLost = bike;
          continue;
        }

        // fill in your trail
        game.grid[bike.position.x][bike.position.y] = bike.color;
      }

      // handle game over:
      if (bikeThatLost != null) {
        // TODO: handle game over
      }

      // render
      render(game);
      return game;
    }
  }
  return game;
}


module.exports = {gameReducer}
