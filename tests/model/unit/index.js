import React from 'react';
import ReactDOM from 'react-dom';
import Player from '../components/player';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        file="https://media.w3.org/2010/05/sintel/trailer.mp4"
        resolve={resolve}
        controls={{
          speed: true,
        }}
        tracks={[
          {
            kind: 'subtitle',
            file: `https://dog-days.github.io/demo/static/subtitle-zh-cn.vtt`,
            label: '中文',
          },
          {
            kind: 'subtitle',
            file: `https://dog-days.github.io/demo/static/subtitle-en.vtt`,
            label: 'English',
          },
        ]}
      />,
      document.getElementById(id)
    );
  });
}
