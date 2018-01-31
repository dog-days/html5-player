//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as videoNamespace } from '../../model/video';
import { namespace as playPauseNamespace } from '../../model/play-pause';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    playing: state[playPauseNamespace],
  };
})
@clearDecorator([playPauseNamespace])
export default class PlayPause extends React.Component {
  static propTypes = {};
  displayName = 'PlayPause';
  state = {};
  dispatch = this.props.dispatch;
  play = e => {
    e.stopPropagation();
    this.dispatch({
      type: `${videoNamespace}/play`,
      payload: {
        noControlbarAction: true,
      },
    });
  };
  pause = e => {
    e.stopPropagation();
    this.dispatch({
      type: `${videoNamespace}/pause`,
    });
  };
  render() {
    const { playing, living } = this.props;
    if (living) {
      return false;
    }
    return (
      <button
        className="nan-small-button"
        onClick={playing ? this.pause : this.play}
      >
        <svg
          className={classnames('nan-icon', {
            'nan-icon-pause': playing,
            'nan-icon-play': !playing,
          })}
          aria-hidden="true"
        >
          <use
            xlinkHref={classnames({
              '#icon-pause': playing,
              '#icon-play': !playing,
            })}
          />
        </svg>
      </button>
    );
  }
}
