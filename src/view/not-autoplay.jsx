//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as notAutoPlayNamespace } from '../model/not-autoplay';
import { namespace as videoNamespace } from '../model/video';

/**
 * 播放器视频播放结束后的组件
 */
@connect(state => {
  return {
    show: state[notAutoPlayNamespace],
  };
})
@clearDecorator([notAutoPlayNamespace])
export default class NotAutoPlay extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'NotAutoPlay';
  dispatch = this.props.dispatch;
  render() {
    const { show } = this.props;
    if (!show) {
      //这里不return false 是为了方便单元测试判断。
      return <div className="html5-player-play-view html5-player-hide" />;
    }
    return (
      <div
        className="html5-player-cover-view html5-player-play-view"
        onDoubleClick={e => {
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {show && (
          <button
            className="html5-player-middle-button"
            onClick={e => {
              e.stopPropagation();
              this.dispatch({
                type: `${videoNamespace}/playAfterNotAutoplay`,
              });
            }}
          >
            <svg
              className="html5-player-icon html5-player-play-big-icon"
              aria-hidden="true"
            >
              <use xlinkHref="#icon-play" />
            </svg>
          </button>
        )}
      </div>
    );
  }
}
