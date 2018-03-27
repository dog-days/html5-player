import React from 'react';
import Html5Player from 'html5-player';

export default class View extends React.Component {
  //必须是.m3u8或者.m3u后缀名的文件才可以播放。
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <Html5Player
            file="https://dog-days.github.io/demo/static/react.mp4"
            autoplay
            tracks={[
              {
                kind: 'thumbnail',
                file: `https://dog-days.github.io/demo/static/hls/react/thumbnails.vtt`,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}
