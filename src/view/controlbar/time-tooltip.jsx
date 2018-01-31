//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import isString from 'lodash/isString';
//内部依赖包
import Tooltip from '../components/tooltip';
import { hms, dateFormat } from '../../utils/util';
import { namespace as timeNamespace } from '../../model/time';
import { namespace as trackerNamespace } from '../../model/track';
import { namespace as fragmentNamespace } from '../../model/fragment';

@connect(state => {
  const thumbnails = state[trackerNamespace].thumbnails;
  const props = {
    duration: state[timeNamespace].secondDuration,
    fragment: state[fragmentNamespace],
    thumbnails,
  };
  return props;
})
export default class TimeTooltip extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'TimeTooltip';
  state = {
    percent: 0.5,
  };
  dispatch = this.props.dispatch;
  onChange = percent => {
    this.setState({
      percent,
    });
  };
  renderContent() {
    //historyTrack是播放录像（合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
    //但是这个视频不是整个时段的，会有断的，historyTrack就是给用户知道这段录像哪里断了）
    //一般都用不到historyTrack，如果存在historyTrack就优先使用historyTrack的duration
    let { duration, fragment, thumbnails, timeSliderShowFormat } = this.props;
    const { videoBeginDateTime } = fragment;
    if (duration === 0) {
      return false;
    }
    if (fragment && fragment.duration) {
      duration = fragment.duration;
    }
    const { percent = 0.5 } = this.state;
    if (thumbnails && thumbnails[0]) {
      const position = percent * duration;
      const style = {};
      thumbnails.forEach(v => {
        if (position >= v.begin && position < v.end) {
          let url = '';
          if (!isString(v)) {
            //一张图片中有多张缩略图
            url = v.thumbnail[1];
            style.backgroundImage = 'url("' + url + '")';
            style.backgroundPosition =
              v.thumbnail[2] * -1 + 'px ' + v.thumbnail[3] * -1 + 'px';
            style.width = v.thumbnail[4] + 'px';
            style.height = v.thumbnail[5] + 'px';
          } else {
            //单张图片直接做缩略图
            url = v.thumbnail;
          }
        }
      });
      return (
        <div
          className={classnames('html5-player-time-tooltip-content', {
            'html5-player-thumbnail-tooltip-content': thumbnails,
          })}
        >
          <div className="html5-player-thumbnail" style={style} />
          <span className="html5-player-thumbnail-time">{hms(percent * duration)}</span>
        </div>
      );
    } else {
      return (
        <div className="html5-player-time-tooltip-content">
          {(!videoBeginDateTime || timeSliderShowFormat === 'time') &&
            hms(percent * duration)}
          {videoBeginDateTime &&
            timeSliderShowFormat === 'date' &&
            dateFormat(
              (videoBeginDateTime + percent * duration) * 1000,
              'YYYY-MM-DD HH:mm:ss'
            )}
        </div>
      );
    }
  }
  render() {
    return (
      <Tooltip
        className="html5-player-time-tooltip"
        content={this.renderContent()}
        type="move"
        onChange={this.onChange}
        percent={this.state.percent}
        isAnimateActive={false}
      >
        <div className="html5-player-for-tooltip" />
      </Tooltip>
    );
  }
}
