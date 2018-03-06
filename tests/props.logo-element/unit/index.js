import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';
import logo from 'tests/assets/logo.png';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://media.w3.org/2010/05/sintel/trailer.mp4"
        autoplay={false}
        logo={
          <a
            className="logo-test"
            href="https://github.com/dog-days/html5-player"
          >
            <img src={logo} alt="" />
          </a>
        }
      />,
      document.getElementById(id)
    );
  });
}
