//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as videoNamespace } from '../../model/video';
import { namespace as rotateNamespace } from '../../model/rotate';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    rotate: state[rotateNamespace],
  };
})
@clearDecorator([rotateNamespace])
export default class PlayPause extends React.Component {
  static propTypes = {};
  displayName = 'PlayPause';
  state = {};
  dispatch = this.props.dispatch;
  rotate = e => {
    e.stopPropagation();
    let { rotate } = this.props;
    if (rotate === 360) {
      rotate = 0;
    }
    this.dispatch({
      type: `${videoNamespace}/rotate`,
      payload: rotate + 90,
    });
  };
  render() {
    return (
      <button
        className="html5-player-small-button float-right html5-player-rotate-button"
        onClick={this.rotate}
      >
        <svg
          className={classnames('html5-player-icon html5-player-rotate-icon')}
          aria-hidden="true"
        >
          <use xlinkHref="#icon-rotate-left" />
        </svg>
      </button>
    );
  }
}
