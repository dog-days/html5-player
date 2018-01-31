import React from 'react';
import NanPlayer from 'nan-player';

export default class View extends React.Component {
  //必须是.m3u8或者.m3u后缀名的文件才可以播放。
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <NanPlayer
            file="http://media.w3.org/2010/05/bunny/trailer.mp4"
            autoplay
            tracks={[
              {
                kind: 'thumbnail',
                file: `https://assets-jpcust.jwpsrv.com/strips/1g8jjku3-120.vtt`,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}
