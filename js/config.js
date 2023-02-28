const isLocalHost = true;

const config = {
  isLocalHost,

  URL: isLocalHost ? null : "https://benhub.io",
  path: isLocalHost ? null : "/Tron/socket.io",

  worldSize: {width: 50, height: 50},
  msPerTick: 100,
  numBoosts: 3,
}

module.exports = {
  config,
};
