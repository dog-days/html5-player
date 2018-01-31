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
      return false;
    }
    return (
      <div
        className="nan-cover-view nan-play-view"
        onDoubleClick={e => {
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <button
          className="nan-middle-button"
          onClick={e => {
            e.stopPropagation();
            this.dispatch({
              type: `${videoNamespace}/hideNotAutoPlayView`,
            });
          }}
        >
          <svg className="nan-icon nan-play-big-icon" aria-hidden="true">
            <use xlinkHref="#icon-play" />
          </svg>
        </button>
      </div>
    );
  }
}
