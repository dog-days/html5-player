//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
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
  static contextTypes = {
    playlist: PropTypes.array,
    activeItem: PropTypes.number,
    setActiveItem: PropTypes.func,
    isHistory: PropTypes.bool,
  };
  static displayName = 'End';
  state = {};
  dispatch = this.props.dispatch;
  componentDidUpdate(prevProps, prevState) {
    if (this.props.end) {
      //播放列表，单个视频播放完的情况
      const { activeItem, setActiveItem } = this.context;
      if (!this.isLastVideo) {
        setActiveItem(activeItem + 1);
      }
    }
  }
  //是否是最后一个可以播放的视频
  get isLastVideo() {
    let { playlist, activeItem, isHistory } = this.context;
    if (isHistory) {
      //history列表的从0算起
      activeItem += 1;
      if (
        playlist[activeItem] &&
        !playlist[activeItem].file &&
        playlist.length - 1 === activeItem
      ) {
        //判断下一个是否有视频（最后一个视频）
        return true;
      }
    }
    if (playlist && playlist[0] && activeItem < playlist.length) {
      return false;
    }
    return true;
  }
  replay = e => {
    const { isHistory, setActiveItem, activeItem } = this.context;
    if (isHistory && activeItem !== 0) {
      setActiveItem(0);
    } else {
      this.dispatch({
        type: `${videoNamespace}/replay`,
      });
    }
  };
  getClassName(flag) {
    return classnames('html5-player-cover-view html5-player-end-view', {
      'html5-player-hide': flag,
    });
  }
  render() {
    const { end } = this.props;
    if (!end || !this.isLastVideo) {
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
        <button className="html5-player-middle-button" onClick={this.replay}>
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
