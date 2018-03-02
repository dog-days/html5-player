import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';

export default function() {
  return new Promise(function(resolve) {
    const id = 'test';
    const div = document.createElement('div');
    div.setAttribute('id', id);
    document.body.appendChild(div);

    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://media.w3.org/2010/05/sintel/trailer.mp4"
        autoplay={true}
        fragment="https://dog-days.github.io/demo/html5-player/fragment.json"
      />,
      document.getElementById(id)
    );
  });
}
