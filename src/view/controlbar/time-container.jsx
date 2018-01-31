//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as timeNamespace } from '../../model/time';
import { namespace as fragmentNamespace } from '../../model/fragment';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    time: state[timeNamespace],
    fragment: state[fragmentNamespace],
  };
})
@clearDecorator([timeNamespace])
export default class Time extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'Time';
  state = {};
  dispatch = this.props.dispatch;
  render() {
    //fragment是播放录像（合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
    //但是这个视频不是整个时段的，会有断的，fragment就是给用户知道这段录像哪里断了）
    //一般都用不到fragment，如果存在fragment就优先使用fragment的duration
    const { time: { elapse, duration }, fragment } = this.props;
    return (
      <span className="html5-player-time-container">
        <span>{elapse}</span>
        <span className="html5-player-time-separater">/</span>
        <span>{(fragment && fragment.timeDuration) || duration}</span>
      </span>
    );
  }
}
