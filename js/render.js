const {isHost} = require('./selectors/sessions');
const {subtract, vectorTheta} = require('bens_utils').vectors;

const render = (game) => {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const {width, height} = game.worldSize;
  // happens once in ui/Game initialization
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  for (const bike of game.bikes) {
    setColorAtPixel(imageData, bike.color, width, bike.position.x, bike.position.y);
  }
  ctx.putImageData(imageData, 0, 0, 0, 0, width, height);

}

const setColorAtPixel = (imageData, color, width, x, y) => {
  const index = 4 * y * width + 4 * x;
  imageData.data[index] = color == 'red' ? 255 : 0;
  imageData.data[index + 1] = 0;
  imageData.data[index + 2] = color == 'blue' ? 255 : 0;
  imageData.data[index + 3] = 255;
};

module.exports = {
  render,
};

