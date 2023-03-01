
const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet, TextField,
  Slider, Checkbox,
  CheckerBackground,
} = require('bens_ui_components');
const {dispatchToServer} = require('../clientToServer');
const {isHost, getSession} = require('../selectors/sessions');
const {useEffect, useState, useMemo} = React;

const Lobby = (props) => {
  const {dispatch, state, getState} = props;

  const sessionCards = [];
  for (const sessionID in state.sessions) {
    sessionCards.push(<SessionCard
      key={"sessionCard_" + sessionID}
      state={state}
      session={state.sessions[sessionID]}
      joinedSessionID={getSession(state)?.id}
    />);
  }

  return (
    <div
      style={{
        width: 300,
        margin: 'auto',
        marginTop: 100,
      }}
    >
      <CreateGameCard />
      {sessionCards}
    </div>
  );
};

const CreateGameCard = (props) => {
  const [name, setName] = useState('');
  return (
    <InfoCard
      style={{
        width: 300,
        marginLeft: 0,
      }}
    >
      Game Name:&nbsp;
      <TextField
        value={name}
        onChange={setName}
      />
      <Button
        label="Create Game"
        style={{
          width: '100%',
          height: 30,
          marginTop: 8,
        }}
        onClick={() => {
          dispatchToServer({type: 'CREATE_SESSION', name: name != '' ? name : null});
        }}
      />
    </InfoCard>
  );
}

const SessionCard = (props) => {
  const {session, joinedSessionID, state} = props;
  const {id, name, clients} = session;
  return (
    <InfoCard
      style={{
        width: 300,
        marginLeft: 0,
      }}
    >
      <div style={{textAlign: 'center'}}><b>{name}</b></div>
      Players: {clients.length}
      {joinedSessionID == id ? (
        <Settings {...props} />
      ) : null}
      {joinedSessionID == id ? (
        <Button
          style={{
            width: '100%',
            height: 30,
          }}
          disabled={clients.length < 2}
          label={isHost(props.state) ? "Start" : "Ready"}
          disabled={
            (isHost(props.state) && !session.ready) ||
            (!isHost(props.state) && session.ready)
          }
          onClick={() => {
            if (isHost(props.state)) {
              dispatchToServer({type: 'START'});
            } else {
              dispatchToServer({type: 'READY'});
            }
          }}
        />
      ) : (
        <Button
          style={{
            width: '100%',
            height: 30,
          }}
          disabled={clients.length >= 2 || session.started}
          label={"Join Game"}
          onClick={() => {
            dispatchToServer({type: 'JOIN_SESSION', sessionID: id});
          }}
        />
      )}

    </InfoCard>
  );
};

const Settings = (props) => {
  const {session, joinedSessionID, state} = props;

  return (
    <div>
      <div><b>Settings:</b></div>
      Game ms per tick:
      <Slider value={state.config.msPerTick} min={1} max={1000}
        noOriginalValue={true}
        onChange={(msPerTick) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', msPerTick});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', msPerTick});
        }}
      />
      <div></div>
    </div>
  );
};


module.exports = Lobby;

