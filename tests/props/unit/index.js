import React from 'react';
import ReactDOM from 'react-dom';

import Player from '../components/player';
import logo from 'tests/assets/logo.png';

export default function(id) {
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Player
        resolve={resolve}
        file="https://dog-days.github.io/demo/static/react.mp4"
        title="test"
        preload={false}
        autoplay={true}
        muted={true}
        width={500}
        aspectratio="4:3"
        controls={{
          capture: true,
          playPause: false,
          volume: false,
          fullscreen: false,
          setting: true,
          time: false,
          timeSlider: false,
          speed: true,
          rotate: true,
          dowload: (
            <a className="test-icon-down float-right" target="_blank">
              <svg className="html5-player-icon" aria-hidden="true">
                <use xlinkHref="#icon-download" />
              </svg>
            </a>
          ),
        }}
        logo={{
          image: logo,
          link: 'https://github.com/dog-days/html5-player',
        }}
        poster={logo}
        playbackRates={[0.5, 1]}
        contextMenu={[<a href="#demo">demo</a>, <a href="#demo2">demo2</a>]}
      />,
      document.getElementById(id)
    );
  });
}
