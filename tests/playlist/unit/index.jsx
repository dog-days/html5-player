import React from 'react';
import ReactDOM from 'react-dom';

import Html5PlayerList from '../../../src/playlist';
import videoUnit from './model/video.js';
import { childListChangeObserver } from '../../util';

export default function(id) {
  const playlist = [];
  const count = 20;
  for (var i = 0; i < count; i++) {
    let obj = {
      title: `第${i + 1}集`,
      cover:
        'https://t12.baidu.com/it/u=2991737441,599903151&fm=173&app=25&f=JPEG?w=538&h=397&s=ECAA21D53C330888369488B703006041',
    };
    //random是为了让file不一样，一样的file切换的时候是不会重新载入的。
    obj.file = `https://dog-days.github.io/demo/static/react.mp4?random=${Math.random()}`;
    playlist.push(obj);
  }
  let firstTimeRun = true;
  return new Promise(function(resolve) {
    ReactDOM.render(
      <Html5PlayerList
        playlist={playlist}
        autoplay
        activeItem={1}
        videoCallback={function(player) {
          if (firstTimeRun) {
            //只给运行一次
            childListChangeObserver('.html5-player-container', function() {
              //确保运行了，model/vidoe中的init saga
              videoUnit(player, count, resolve);
            });
            firstTimeRun = false;
          }
        }}
      />,
      document.getElementById(id)
    );
  });
}
