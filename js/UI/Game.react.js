const React = require('react');
const {
  Button, InfoCard, Divider,
  Canvas,
  Modal, Indicator,
  useMouseHandler,
  useHotKeyHandler,
} = require('bens_ui_components');
const {config} = require('../config');
const {
  getYourBike, oppositeDir,
} = require('../selectors/misc');
const {dispatchToServer} = require('../clientToServer');
import postVisit from '../postVisit';
const {useState, useMemo, useEffect, useReducer} = React;


function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;

  // initializations
  useEffect(() => {
    postVisit('/game', 'GET');

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const {width, height} = getState().game.worldSize;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  }, []);

  // hotkeys
  useHotKeyHandler({dispatch, getState: () => getState().game.hotKeys});
  useEffect(() => {
    for (const dir of ['left', 'right', 'up', 'down']) {
      dispatch({type: "SET_HOTKEY", key: dir, press: 'onKeyDown', fn: () => {
        const game = getState().game;
        const bike = getYourBike(game);
        if (bike.direction != dir && dir != oppositeDir(bike.direction)) {
          const action = {type: 'SET_DIRECTION', direction: dir, time: game.time + 1};
          dispatch({type: 'ENQUEUE_ACTION', action});
          dispatchToServer({type: 'ENQUEUE_ACTION', action: {...action, isOther: true}});
        }
      }});
    }
    dispatch({type: "SET_HOTKEY", key: 'space', press: 'onKeyDown', fn: () => {
      const game = getState().game;
      const bike = getYourBike(game);
      if (bike.boosts > 0) {
        const action = {type: 'SET_BOOST', time: game.time + 1};
        dispatch({type: 'ENQUEUE_ACTION', action});
        dispatchToServer({type: 'ENQUEUE_ACTION', action: {...action, isOther: true}});
      }
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
