import React from 'react';
import NanPlayer from 'nan-player';

class View extends React.Component {
  state = {};
  onInputChange = e => {
    this.setState({
      value: e.target.value,
    });
  };
  onKeyDown = e => {
    if (e.keyCode === 13) {
      const { value = `${process.env.basename}/test.mp4` } = this.state;
      this.setState({
        file: value,
      });
    }
  };
  render() {
    const file = this.state.file || `${process.env.basename}/test.mp4`;
    return (
      <div className="demo-container">
        <div className="player-container">
          <input
            onChange={this.onInputChange}
            onKeyDown={this.onKeyDown}
            className="url-input"
            value={
              this.state.value ||
              `${location.origin}${process.env.basename}/test.mp4`
            }
          />
          <NanPlayer
            flvConfig={
              {
                // enableWorker: true,
              }
            }
            controls={{
              dowload: (
                <a
                  className="float-right"
                  href={file}
                  target="_blank"
                  download={file}
                >
                  <svg className="nan-icon" aria-hidden="true">
                    <use xlinkHref="#icon-download" />
                  </svg>
                </a>
              ),
              speed: true,
            }}
            title="这里是标题"
            file={file}
            // autoplay
            //logo支持string，React Element和plainObject
            logo={{
              image: `${process.env.basename}/logo.png`,
              link: 'https://github.com/dog-days/nan-player',
            }}
          />
        </div>
      </div>
    );
  }
}

export default View;
