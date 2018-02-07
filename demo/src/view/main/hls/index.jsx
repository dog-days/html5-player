import React from 'react';
import Html5Player from 'html5-player';

export default class View extends React.Component {
  //必须是.m3u8或者.m3u后缀名的文件才可以播放。
  render() {
    return (
      <div className="demo-container">
        <h3>必须是.m3u8或者.m3u后缀名的文件才可以播放。</h3>
        <div className="player-container">
          <Html5Player file="https://wowzaec2demo.streamlock.net/live/bigbuckbunny/playlist.m3u8" />
        </div>
      </div>
    );
  }
}
