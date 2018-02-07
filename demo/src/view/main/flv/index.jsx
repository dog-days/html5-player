import React from 'react';
import Html5Player from 'html5-player';

export default class View extends React.Component {
  render() {
    //线上直播找不到没跨域问题的
    return (
      <div className="demo-container">
        <h3>必须是.flv后缀名的文件，或者包含.flv的链接才可以播放。</h3>
        <div className="player-container">
          <Html5Player file="https://dog-days.github.io/demo/static/test.flv" />
        </div>
        <div>
          <br />
          如果使用直播，需要设置enableWorker，可以减少延时到1秒左右。
          但是如果不是直播，不可以设置，否则会报错。
          <br />
          <b>
            由于flv直播状态兼容性问题，需要通过设置isLiving=true来强制设置为直播状态。
          </b>
          <pre>
            {`<Html5Player isLiving={true} file="http://livechina.cntv.wscdns.com:8000/live/flv/channel1474?type=test.flv" flvConfig={{enableWorker: true}}/>`}
          </pre>
        </div>
      </div>
    );
  }
}
