const isLocalHost = true;

const config = {
  isLocalHost,

  URL: isLocalHost ? null : "https://benhub.io",
  path: isLocalHost ? null : "/Tron/socket.io",

  worldSize: {width: 150, height: 150},
  msPerTick: 50,
  numBoosts: 3,
  boostDuration: 6,
}

module.exports = {
  config,
};
