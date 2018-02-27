//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as videoNamespace } from '../../model/video';
import { namespace as fullscreenStateNamespace } from '../../model/fullscreen';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    isfull: state[fullscreenStateNamespace],
  };
})
@clearDecorator([fullscreenStateNamespace])
export default class FullOffScreen extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'FullOffScreen';
  state = {};
  dispatch = this.props.dispatch;
  onFullStateChange = e => {
    e.stopPropagation();
    const { isfull } = this.props;
    this.dispatch({
      type: `${videoNamespace}/fullscreen`,
      payload: !isfull,
    });
  };
  render() {
    const { isfull } = this.props;
    return (
      <button
        className="html5-player-small-button float-right"
        onClick={this.onFullStateChange}
      >
        <svg
          className={classnames(
            'html5-player-icon html5-player-screen-full-off-icon',
            {
              'html5-player-fullscreen-icon': !isfull,
              'html5-player-fullscreen-off-icon': isfull,
            }
          )}
          aria-hidden="true"
        >
          <use
            xlinkHref={classnames({
              '#icon-fullscreen': !isfull,
              '#icon-fullscreen-off': isfull,
            })}
          />
        </svg>
      </button>
    );
  }
}
