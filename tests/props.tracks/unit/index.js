import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://media.w3.org/2010/05/sintel/trailer.mp4"
        autoplay={true}
        tracks={[
          {
            kind: 'captions',
            file: 'https://dog-days.github.io/demo/html5-player/caption.vtt',
          },
          {
            kind: 'thumbnail',
            file: `https://dog-days.github.io/demo/html5-player/thumbnail.vtt?random=94547.1381800726`,
          },
        ]}
      />,
      document.getElementById(id)
    );
  });
}
