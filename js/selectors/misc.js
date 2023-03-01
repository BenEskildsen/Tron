
const getYourBike = (game) => {
  for (const bike of game.bikes) {
    if (bike.isYou) return bike;
  }
}

const getOtherBike = (game) => {
  for (const bike of game.bikes) {
    if (!bike.isYou) return bike;
  }
};

const oppositeDir = (dir) => {
  switch (dir) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'up':
      return 'down';
    case 'down':
      return 'up';
  }
}

module.exports = {
  getYourBike,
  getOtherBike,
  oppositeDir,
};
