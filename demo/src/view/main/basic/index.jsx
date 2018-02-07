import React from 'react';
import Html5Player from 'html5-player';

class View extends React.Component {
  state = {
    value: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    changeFile: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
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
            controls={{
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
            // autoplay
            //logo支持string，React Element和plainObject
            logo={{
              image: `${process.env.basename}/logo.png`,
              link: 'https://github.com/dog-days/html5-player',
            }}
          />
        </div>
      </div>
    );
  }
}

export default View;
