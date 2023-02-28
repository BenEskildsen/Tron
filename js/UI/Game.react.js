const React = require('react');
const {
  Button, InfoCard, Divider,
  Canvas,
  Modal, Indicator,
  useMouseHandler,
  useHotKeyHandler,
} = require('bens_ui_components');
const {config} = require('../config');
const {dispatchToServer} = require('../clientToServer');
import postVisit from '../postVisit';
const {useState, useMemo, useEffect, useReducer} = React;


function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;

  // initializations
  useEffect(() => {
    postVisit('/game', 'GET');
  }, []);

  // hotkeys
  useHotKeyHandler({dispatch, getState: () => getState().game.hotKeys});
  useEffect(() => {
    for (const dir of ['left', 'right', 'up', 'down']) {
      dispatch({type: "SET_HOTKEY", key: dir, press: 'onKeyDown', fn: () => {
        console.log("set direction", dir);
        dispatch({type: 'SET_DIRECTION', direction: dir});
        // TODO: also need to send this to the server
      }});
    }
    dispatch({type: "SET_HOTKEY", key: 'space', press: 'onKeyDown', fn: () => {
      // TODO: check that you have boosts available
      dispatch({type: 'SET_BOOST'});
    }});
  }, []);


  return (
    <div
      style={{

      }}
    >
      <Canvas
        useFullScreen={true}
        view={game.worldSize}
      />
    </div>
  );
}


module.exports = Game;
