const React = require('react');
const {gameReducer} = require('./gameReducer');
const {modalReducer} = require('./modalReducer');
// const GameOverModal = require('../UI/GameOverModal.react');
const {mouseReducer, hotKeyReducer} = require('bens_ui_components');
const {getSession, isHost} = require('../selectors/sessions');
const {config} = require('../config');
const {deepCopy} = require('bens_utils').helpers;
const {equals} = require('bens_utils').vectors;

const rootReducer = (state, action) => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'CREATE_SESSION': {
      const {clientID, session} = action;
      if (clientID != state.clientID) {
        return {
          ...state,
          sessions: {...state.sessions, [session.id]: {...session}},
        };
      }
      return {
        ...state,
        sessions: {...state.sessions, [session.id]: session},
      };
    }
    case 'JOIN_SESSION': {
      const {sessionID, clientID} = action;
      const session = state.sessions[sessionID];
      session.clients.push(clientID);
      if (clientID != state.clientID) {
        return {
          ...state,
          sessions: {...state.sessions, [sessionID]: {...session}},
        };
      }
      return {
        ...state,
        sessions: {...state.sessions, [sessionID]: {...session}},
      };
    }
    case 'UPDATE_SESSION': {
      const {session} = action;
      return {
        ...state,
        sessions: {...state.sessions, [session.id]: {...session}},
      };
    }
    case 'END_SESSION': {
      const {sessionID} = action;
      if (getSession(state)?.id == sessionID) {
        state.screen = 'LOBBY';
        state.game = null;
        state.modal = null;
      }
      delete state.sessions[sessionID];
      return {...state};
    }

    case 'EDIT_SESSION_PARAMS': {
      delete action.type;
      for (const property in action) {
        state.config[property] = action[property];
      }
      return {...state};
    }
    case 'GAME_OVER': {
      const {winner} = action;

      return {
        ...state,
        // modal: <GameOverModal {...action} />
      };
    }
    case 'SET_SCREEN': {
      const {screen} = action;
      const nextState = {...state, screen};
      if (screen == 'LOBBY') {
        nextState.game = null;
      }
      return nextState;
    }
    case 'SET_MOUSE_DOWN':
    case 'SET_MOUSE_POS':
      return {
        ...state,
        mouse: mouseReducer(state.mouse, action),
      };
    case 'SET_HOTKEY':
    case 'SET_KEY_PRESS': {
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          hotKeys: hotKeyReducer(state.game.hotKeys, action),
        }
      }
    }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START': {
      const {entities} = action;
      const game = {
        ...initGameState(state, state.config, state.clientID),
        clientID: state.clientID,
        entities,
        prevTickTime: new Date().getTime(),
        tickInterval: setInterval(
          // HACK: dispatch is only available via window
          () => dispatch({type: 'TICK'}),
          state.config.msPerTick,
        ),
      };
      return {
        ...state,
        screen: "GAME",
        game,
      };
    }
    case 'SET':
    case 'SET_DIRECTION':
    case 'SET_BOOST':
    case 'ENQUEUE_ACTION':
    case 'SELECT_ENTITIES':
    case 'TICK':
    case 'STOP_TICK':
    case 'SET_ENTITIES': {
      if (!state.game) return state;
      return {
        ...state,
        game: gameReducer(state.game, action),
      };
    }
  }
  return state;
};


//////////////////////////////////////
// Initializations
const initState = () => {
  return {
    screen: 'LOBBY',
    game: null,
    modal: null,
    sessions: {},
    config: deepCopy(config),
  };
}

const initGameState = (state, config, clientID) => {
  const game = {
    time: 0,
    bikes: [],
    actions: [[]], // Arrayarray where each index is an array of actions that
      // occurred on that tick

    config: deepCopy(config),

    worldSize: {...config.worldSize},
    canvasSize: {width: window.innerWidth, height: window.innerHeight},
    clientID,

    hotKeys: {
      onKeyDown: {},
      onKeyPress: {},
      onKeyUp: {},
      keysDown: {},
    },
  };

  // initialize bikes
  game.bikes.push({
    isYou: isHost(state),
    color: 'blue',
    position: {
      x: Math.round(config.worldSize.width / 3),
      y: Math.round(config.worldSize.height / 2),
    },
    direction: 'right',
    boosts: config.numBoosts,
    boost: 0,
    prevPositions: [],
  });
  game.bikes.push({
    isYou: !isHost(state),
    color: 'red',
    position: {
      x: 2 * Math.round(config.worldSize.width / 3),
      y: Math.round(config.worldSize.height / 2),
    },
    direction: 'left',
    boosts: config.numBoosts,
    boost: 0,
    prevPositions: [],
  });

  return game;
}

module.exports = {rootReducer, initState};

