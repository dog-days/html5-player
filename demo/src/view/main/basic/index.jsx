import React from 'react';
import Html5Player from 'html5-player';
// import { joinUrlParams } from '../../../../../src/utils/util';

class View extends React.Component {
  state = {
    value:
      'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8',
    changeFile:
      'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8',
  };
  onInputChange = e => {
    this.setState({
      value: e.target.value,
    });
  };
  onKeyDown = e => {
    if (e.keyCode === 13) {
      const { value } = this.state;
      this.setState({
        changeFile: value,
      });
    }
  };
  videoCallback = player => {
    // player.on('error', () => {
    //   clearTimeout(this.clearTimeout);
    //   this.timeout = setTimeout(() => {
    //     this.setState({
    //       changeFile: joinUrlParams(this.state.changeFile, {}),
    //     });
    //   }, 3000);
    // });
  };
  render() {
    const { changeFile, value } = this.state;
    const file = changeFile;
    return (
      <div className="demo-container">
        <div className="player-container">
          <input
            onChange={this.onInputChange}
            onKeyDown={this.onKeyDown}
            className="url-input"
            value={value}
          />
          <Html5Player
            flvConfig={{ enableWorker: true }}
            livingMaxBuffer={3}
            videoCallback={this.videoCallback}
            timeout={1000 * 10}
            // contextMenu={[<a href="#demo">demo</a>, <a href="#demo2">demo2</a>]}
            // playbackRates={[0.5, 1]}
            autoplay={true}
            // muted={true}
            retryTimes={1000000000000}
            controls={{
              capture: true,
              setting: true,
              rotate: true,
              dowload: (
                <a
                  className="float-right"
                  href={file}
                  target="_blank"
                  download={file}
                >
                  <svg className="html5-player-icon" aria-hidden="true">
                    <use xlinkHref="#icon-download" />
                  </svg>
                </a>
              ),
              speed: true,
            }}
            title="这里是标题"
            file={file}
            // isLiving={true}
            // autoplay
            //logo支持string，React Element和plainObject
            // logo={`${process.env.basename}/logo.png`}
            // poster={`${process.env.basename}/logo.png`}
          />
        </div>
      </div>
    );
  }
}

export default View;
