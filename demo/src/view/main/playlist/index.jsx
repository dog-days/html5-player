import React from 'react';
import Html5PlayerList from 'html5-player/libs/playlist';

export default class View extends React.Component {
  render() {
    const playlist = [];
    for (var i = 0; i < 20; i++) {
      let obj = {
        title: `第${i + 1}集`,
        cover:
          'https://t12.baidu.com/it/u=2991737441,599903151&fm=173&app=25&f=JPEG?w=538&h=397&s=ECAA21D53C330888369488B703006041',
      };
      //random是为了让file不一样，一样的file切换的时候是不会重新载入的。
      if (i % 2 === 0) {
        obj.file = `https://wowzaec2demo.streamlock.net/live/bigbuckbunny/playlist.m3u8?random=${Math.random()}`;
      } else {
        obj.file = `https://dog-days.github.io/demo/static/react.mp4?random=${Math.random()}`;
      }
      playlist.push(obj);
    }
    return (
      <div className="demo-container">
        <h3>播放列表</h3>
        <div className="player-container">
          <Html5PlayerList
            playlist={playlist}
            autoplay
            activeItem={2}
            // videoCarousel={1000 * 60}
          />
        </div>
      </div>
    );
  }
}
