
const getYourBike = (game) => {
  for (const bike of game.bikes) {
    if (bike.isYou) return bike;
  }
}

module.exports = {
  getYourBike,
};
