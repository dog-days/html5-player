//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as endNamespace } from '../model/end';
import { namespace as videoNamespace } from '../model/video';

/**
 * 播放器视频播放结束后的组件
 */
@connect(state => {
  return {
    end: state[endNamespace],
  };
})
@clearDecorator([endNamespace])
export default class End extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  static displayName = 'End';
  state = {};
  dispatch = this.props.dispatch;
  replay = e => {
    this.dispatch({
      type: `${videoNamespace}/replay`,
    });
  };
  getClassName(flag) {
    return classnames('html5-player-cover-view html5-player-end-view', {
      'html5-player-hide': flag,
    });
  }
  render() {
    const { end } = this.props;
    if (!end) {
      return <div className={this.getClassName(true)} />;
    }
    return (
      <div
        className={this.getClassName()}
        onDoubleClick={e => {
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className="html5-player-middle-button"
          onClick={this.replay}
        >
          <svg
            className="html5-player-icon html5-player-replay-icon"
            aria-hidden="true"
          >
            <use xlinkHref="#icon-replay" />
          </svg>
        </button>
      </div>
    );
  }
}
