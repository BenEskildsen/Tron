const {
  leaveSession, emitToSession, emitToAllClients,
} = require('../sessions');
const {
  initGameState,
} = require('./state');
const {
  getEntitiesByPlayer, getOtherClientID,
} = require('./selectors');


const gameReducer = (state, action, clientID, socket, dispatch) => {
  const {sessions, socketClients, clientToSession} = state;


  let session = sessions[clientToSession[clientID]];
  if (!session) return state;

  const game = session.game;
  switch (action.type) {
    case 'EDIT_SESSION_PARAMS': {
      delete action.type;
      for (const property in action) {
        session.config[property] = action[property];
      }
      emitToSession(session, socketClients,
        {type: 'EDIT_SESSION_PARAMS', ...action}, clientID, true,
      );
      break;
    }
    case 'START': {
      for (const id of session.clients) {
        const clientAction = {
          type: "START",
          config: session.config,
        }
        socketClients[id].emit('receiveAction', clientAction);
      }
      break;
    }
    default: {
      if (!session) break;
      emitToSession(session, socketClients, action, clientID);
    }
  }

  return state;
};

const doGameOver = (session, socketClients, clientID, winner, disconnect) => {
  const game = session.game;
  if (!game) return;
  emitToSession(
    session, socketClients,
    {type: 'GAME_OVER', winner, disconnect, stats: game.stats},
    clientID, true, // include self
  );
}


module.exports = {gameReducer};

