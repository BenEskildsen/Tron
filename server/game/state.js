const initGameState = (clientIDs, config) => {
  const game = {
    time: 0,
    worldSize: {...config.worldSize},
    tickInterval: null,
    entities: {},
    stats: {},
  };

  return game;
};

module.exports = {
  initGameState,
};
