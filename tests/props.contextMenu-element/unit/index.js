import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://media.w3.org/2010/05/sintel/trailer.mp4"
        autoplay={false}
        contextMenu={
          <ul className="context-menu-test">
            <li>
              <a href="#demo">demo</a>
            </li>,
            <li>
              <a href="#demo2">demo2</a>
            </li>,
          </ul>
        }
      />,
      document.getElementById(id)
    );
  });
}
