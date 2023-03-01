// @flow

const {clamp, subtractWithDeficit} = require('bens_utils').math;
const {randomIn, normalIn, oneOf, weightedOneOf} = require('bens_utils').stochastic;
const {render} = require('../render');
const {getYourBike, getOtherBike} = require('../selectors/misc');
const {add, subtract, equals} = require('bens_utils').vectors;


const gameReducer = (game, action) => {
  switch (action.type) {
    case 'SET_DIRECTION': {
      const {direction, time, isOther} = action;
      let bike = getYourBike(game);
      if (isOther) {
        bike = getOtherBike(game);
      }
      bike.direction = direction;
      return game;
    }
    case 'SET_BOOST': {
      const {isOther} = action;
      let bike = getYourBike(game);
      if (isOther) {
        bike = getOtherBike(game);
      }
      bike.boosts -= 1;
      bike.boost += game.config.boostDuration;
      return game;
    }
    case 'ENQUEUE_ACTION': {
      const time = action.action.time;
      if (!game.actions[time]) game.actions[time] = [];
      game.actions[time].push(action.action);

      if (game.time >= time) {
        const numTicks = game.time - time + 1;
        console.log("doing a rollback", numTicks);
        rollBack(game, numTicks);
        rollForward(game, numTicks - 1);
      } else {
        console.log("queueing in the future", time - game.time);
      }
      return game;
    }
    case 'STOP_TICK': {
      clearInterval(game.tickInterval);
      game.tickInterval = null;

      return game;
    }
    case 'TICK': {
      updateSimulation(game);

      // render
      render(game);
      return game;
    }
  }
  return game;
}

const rollBack = (game, numTicks) => {
  game.time -= numTicks;
  for (const bike of game.bikes) {
    for (let i = 0; i < numTicks; i++) {
      bike.position = bike.prevPositions.pop();
    }
  }
  return game;
}

const rollForward = (game, numTicks) => {
  for (let i = 0; i < numTicks; i++) {
    game = updateSimulation(game);
  }
}

const updateSimulation = (game) => {
  game.time += 1;
  if (!game.actions[game.time]) game.actions[game.time] = [];

  // check for enqueued actions
  if (game.actions[game.time].length > 0) {
    for (const action of game.actions[game.time]) {
      game = gameReducer(game, action);
    }
  }

  // move each bike
  let didBothLose = false;
  let bikeThatLost = null;
  for (const bike of game.bikes) {

    let didLose = false;
    // move at half speed when not boosting
    if (bike.boost == 0 && game.time % 2 == 1) continue;
    bike.boost = Math.max(bike.boost - 1, 0); // subtract boost

    let moveVec = {x: 0, y: 0};
    if (bike.direction == 'left') moveVec.x = -1;
    if (bike.direction == 'right') moveVec.x = 1;
    if (bike.direction == 'up') moveVec.y = 1;
    if (bike.direction == 'down') moveVec.y = -1;

    bike.prevPositions.push({...bike.position});
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
    if (didHitTrail(game, bike)) {
      didLose = true;
      if (bikeThatLost != null) didBothLose = true; // check for ties
      bikeThatLost = bike;
      continue;
    }
  }

  // handle game over:
  if (bikeThatLost != null) {
    console.log("game over");
    clearInterval(game.tickInterval);
    game.tickInterval = null;
    // TODO: handle game over
  }
}

const didHitTrail = (game, bike) => {
  for (const b of game.bikes) {
    for (const pos of b.prevPositions) {
      if (equals(pos, bike.position)) {
        return true;
      }
    }
  }
  return false;
}


module.exports = {gameReducer}
