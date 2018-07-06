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
        fragment={{
          fragments: [
            { begin: '2018-06-15 01:37:35', end: '2018-06-17 12:06:00' },
            { begin: '2018-06-17 12:06:00', end: '2018-06-17 12:06:30' },
            { begin: '2018-06-20 12:39:30', end: '2018-06-20 12:40:30' },
          ],
          total: {
            begin: '2018-06-15 01:37:35',
            end: '2018-06-22 02:37:35',
          },
        }}
      />,
      document.getElementById(id)
    );
  });
}
