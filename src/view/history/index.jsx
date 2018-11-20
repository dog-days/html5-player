//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isNumber from 'lodash/isNumber';
import isEqual from 'lodash/isEqual';
//内部依赖包
import clearDecorator from '../decorator/clear';
import View from '../../view';
import { ASPECT_RATIO } from '../../utils/const';
import TimeSlider from './time-slider';

import { namespace as historyNamespace } from '../../model/history';

@connect(state => {
  return {
    historyState: state[historyNamespace],
  };
})
@clearDecorator([historyNamespace])
export default class HistoryPlayer extends React.Component {
  static displayName = 'HistoryPlayer ';
  static propTypes = {
    historyList: PropTypes.oneOfType([
      PropTypes.object.isRequired,
      PropTypes.bool.isRequired,
    ]),
    noneVideoComponent: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    defaultCurrentTime: PropTypes.number,
  };
  static childContextTypes = {
    isHistory: PropTypes.bool,
    historyDuration: PropTypes.number,
  };
  getChildContext() {
    return {
      isHistory: true,
      historyDuration: this.duration(),
    };
  }
  state = {};
  dispatch = this.props.dispatch;
  componentWillMount() {
    const { defaultCurrentTime } = this.props;
    this.dispatch({
      type: `${historyNamespace}/set`,
      payload: {
        fragments: this.fragments(),
        duration: this.duration(),
        defaultCurrentTime,
      },
    });
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.historyList, this.props.historyList)) {
      //historyList不一样，需要进行更新
      const { defaultCurrentTime } = nextProps;
      this.dispatch({
        type: `${historyNamespace}/clear`,
      });
      this.dispatch({
        type: `${historyNamespace}/set`,
        payload: {
          fragments: this.fragments(nextProps),
          duration: this.duration(nextProps),
          defaultCurrentTime,
        },
      });
    }
  }
  fragments(props) {
    const { historyList } = props || this.props;
    const fragments =
      historyList && historyList.fragments && historyList.fragments;
    return fragments || [];
  }
  duration(props) {
    const { historyList } = props || this.props;
    return (historyList && historyList.duration) || 0;
  }
  renderSlider() {
    const {
      historyList: { beginDate },
    } = this.props;
    return (
      <TimeSlider
        fragments={this.fragments()}
        duration={this.duration()}
        beginDateTime={+new Date(beginDate.replace(/-/g, '/')) / 1000}
      />
    );
  }
  getAspectratioNumber(aspectratio) {
    let ratio = aspectratio.split(':');
    if (ratio.length !== 2 || isNaN(ratio[0]) || isNaN(ratio[1])) {
      console.warn(
        'Config error:',
        'Aspectratio format is wrong,aspectratio format should be "x:y".'
      );
      aspectratio = ASPECT_RATIO;
      ratio = aspectratio.split(':');
    }
    return {
      x: parseInt(ratio[0], 10),
      y: parseInt(ratio[1], 10),
    };
  }
  getContainerStyle() {
    let { aspectratio = ASPECT_RATIO, height, width, style } = this.props;
    let containerStyle = {};
    if (width) {
      containerStyle.width = width;
    }
    if (height) {
      containerStyle.height = height;
    }
    if (width && !height && this.playerConainerDOM) {
      //第二次渲染，执行在计算height之前
      width = this.playerConainerDOM.clientWidth;
    }
    if (isNumber(width) && !height) {
      //width是数字是才计算
      const ratio = this.getAspectratioNumber(aspectratio);
      containerStyle.height = width * ratio.y / ratio.x;
    }
    if (style) {
      containerStyle = {
        ...containerStyle,
        ...style,
      };
    }
    return containerStyle;
  }
  render() {
    const {
      noneVideoComponent,
      autoplay,
      controls,
      historyList,
      historyState: { file, defaultCurrentVideoTime },
      ...other
    } = this.props;
    //单个视频，也有defaultCurrentTime
    delete other.defaultCurrentTime;
    const containerStyle = this.getContainerStyle();
    if (!this.fragments()) {
      return (
        <div className="html5-player-container" style={containerStyle}>
          <div className="html5-player-error-message-container">
            {!noneVideoComponent && '请选择有视频的时间段'}
            {noneVideoComponent}
          </div>
        </div>
      );
    }
    if (!file) {
      return false;
    }
    return (
      <View
        {...other}
        file={file}
        controls={{ ...controls, timeSlider: false, time: false }}
        customTimeSlider={this.renderSlider()}
        autoplay={true}
        defaultCurrentTime={defaultCurrentVideoTime}
      />
    );
  }
}
