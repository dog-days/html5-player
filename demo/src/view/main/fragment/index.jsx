import React from 'react';
import Html5Player from 'html5-player';

export default class View extends React.Component {
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <Html5Player
            timeSliderShowFormat="date"
            file="https://jxsr-api.antelopecloud.cn/v2/record/538378757/storage/hls/1529041055_1529649455.m3u8?client_token=538378757_3356491776_1561186094_06eb301c5923ea8e97c2a4ffd315956f"
            fragment={{
              fragments: [
                { begin: '2018-06-15 01:37:35', end: '2018-06-17 12:06:00' },
                { begin: '2018-06-17 12:06:00', end: '2018-06-17 12:06:30' },
                { begin: '2018-06-18 10:47:30', end: '2018-06-18 10:49:30' },
                { begin: '2018-06-20 11:43:30', end: '2018-06-20 11:44:00' },
                { begin: '2018-06-20 12:06:30', end: '2018-06-20 12:07:00' },
                { begin: '2018-06-20 12:39:30', end: '2018-06-20 12:40:30' },
                { begin: '2018-06-21 03:49:30', end: '2018-06-21 03:50:00' },
              ],
              total: {
                begin: '2018-06-15 01:37:35',
                end: '2018-06-22 02:37:35',
              },
            }}
          />
        </div>
      </div>
    );
  }
}
