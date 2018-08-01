import React from 'react';
import Player from 'html5-player/libs/history';

export default class View extends React.Component {
  state = {};
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <button
            onClick={() => {
              // const player = this.player;
              // player.setSeeking(0);
            }}
          >
            test
          </button>
          <Player
            videoCallback={player => {
              this.player = player;
              // player.setSelection({
              //   begin: 5,
              //   end: 70,
              // });
              player.on('selection', data => {
                console.log(player.currentTime);
                console.log(data);
              });
            }}
            selection={true}
            historyList={{
              beginDate: '2018-07-28 00:00:00',
              duration: 20 + 654 + 12 + 52 + 52 + 10 + 654 + 20,
              fragments: [
                {
                  begin: 0,
                  end: 20,
                },
                {
                  begin: 20,
                  end: 20 + 654,
                  file:
                    'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8?test=2',
                },
                {
                  begin: 20 + 654,
                  end: 20 + 654 + 12,
                },
                {
                  begin: 20 + 654 + 12,
                  end: 20 + 654 + 12 + 52,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=2',
                },
                {
                  begin: 20 + 654 + 12 + 52,
                  end: 20 + 654 + 12 + 52 + 52,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=3',
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52,
                  end: 20 + 654 + 12 + 52 + 52 + 10,
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52 + 10,
                  end: 20 + 654 + 12 + 52 + 52 + 10 + 654,
                  file:
                    'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8',
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52 + 10 + 654,
                  end: 20 + 654 + 12 + 52 + 52 + 10 + 654 + 20,
                },
              ],
            }}
          />
        </div>
      </div>
    );
  }
}
