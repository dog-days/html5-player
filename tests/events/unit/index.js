import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://dog-days.github.io/demo/static/react.mp4"
        autoplay={false}
        controls={{
          capture: true,
          speed: true,
          setting: true,
          rotate: true,
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
