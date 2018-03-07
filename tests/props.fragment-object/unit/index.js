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
          total: {
            begin: '2017-10-03 00:00:00',
            end: '2017-10-03 00:01:19',
          },
          fragments: [
            {
              begin: '2017-10-03 00:00:02',
              end: '2017-10-03 00:00:12',
            },
            {
              begin: '2017-10-03 00:00:32',
              end: '2017-10-03 00:00:42',
            },
            {
              begin: '2017-10-03 00:00:45',
              end: '2017-10-03 00:00:52',
            },
          ],
        }}
      />,
      document.getElementById(id)
    );
  });
}
