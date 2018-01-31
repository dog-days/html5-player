import React from 'react';
import NanPlayer from 'nan-player';

export default class View extends React.Component {
  render() {
    //线上直播找不到没跨域问题的
    return (
      <div className="demo-container">
        <h3>必须是.flv后缀名的文件，或者包含.flv的链接才可以播放。</h3>
        <div className="player-container">
          <NanPlayer file={`${process.env.basename}/test.flv`} />
        </div>
        <div>
          <br />
          如果使用直播，需要设置enableWorker，可以减少延时到1秒左右。 但是如果不是直播，不可以设置，否则会报错。
          <br />
          <pre>
            {`<NanPlayer file="http://livechina.cntv.wscdns.com:8000/live/flv/channel1474?type=test.flv" flvConfig={{enableWorker: true}}/>`}
          </pre>
        </div>
      </div>
    );
  }
}
