//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
import downloadjs from 'downloadjs';
//内部依赖包
import { randomKey } from '../../utils/util';

export default class Capture extends React.Component {
  static propTypes = {};
  displayName = 'Capture';
  static contextTypes = {
    playerDOM: PropTypes.object,
  };
  captureName = () => {
    return `capture${randomKey()}.png`;
  };
  capture = e => {
    const video = this.context.playerDOM;
    const canvas = document.createElement('canvas');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
    downloadjs(canvas.toDataURL(), this.captureName(), 'image/png');
  };
  render() {
    return (
      <button
        type="button"
        className="html5-player-small-button float-right html5-player-capture-button"
        onClick={this.capture}
      >
        <svg
          className="html5-player-icon html5-player-capture-icon"
          aria-hidden="true"
        >
          <use xlinkHref="#icon-capture" />
        </svg>
      </button>
    );
  }
}
