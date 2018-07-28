import React from 'react';
import Player from 'html5-player/libs/history';

export default class View extends React.Component {
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <Player
            videoCallback={player => {
              player.setSelection({
                begin: 5,
                end: 15,
              });
              player.on('selection', data => {
                console.log(player.currentTime);
                console.log(data);
              });
            }}
            selection={true}
            historyList={{
              beginDate: '2018-07-28 00:00:00',
              duration: 52 + 12 + 52 + 52 + 10 + 52,
              fragments: [
                {
                  begin: 0,
                  end: 52,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=1',
                },
                {
                  begin: 52,
                  end: 64,
                },
                {
                  begin: 64,
                  end: 116,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=2',
                },
                {
                  begin: 116,
                  end: 168,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=3',
                },
                {
                  begin: 168,
                  end: 178,
                },
                {
                  begin: 178,
                  end: 230,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=4',
                },
              ],
            }}
          />
        </div>
      </div>
    );
  }
}
