//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
//内部依赖包
import Player from '../../index';
import { ASPECT_RATIO } from '../../utils/const';
import TimeSlider from './time-slider';

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

    //当前选择播放的视频源（播放列表中的某项）
    activeItem: PropTypes.number,
  };
  static childContextTypes = {
    playlist: PropTypes.array,
    activeItem: PropTypes.number,
    setActiveItem: PropTypes.func,
    isHistory: PropTypes.bool,
    historyDuration: PropTypes.number,
  };
  getChildContext() {
    return {
      playlist: this.fragments,
      activeItem: this.activeItem,
      setActiveItem: this.setActiveItem,
      isHistory: true,
      historyDuration: this.duration,
    };
  }
  state = {
    activeItem: this.getFirstActiveItem(),
  };
  componentWillReceiveProps(nextProps) {
    this.storage.defaultCurrentTime = 0;
    this.historyListChanged = true;
  }
  //获取第一个可播放的activeItem
  getFirstActiveItem() {
    if (!this.props.historyList) {
      return 0;
    }
    let activeItem = 0;
    for (let k = 0; k < this.fragments.length; k++) {
      const v = this.fragments[k];
      if (v.file) {
        activeItem = k;
        break;
      }
    }
    return activeItem;
  }
  get fragments() {
    const { historyList } = this.props;
    const fragments =
      historyList && historyList.fragments && historyList.fragments;
    return fragments || [];
  }
  get duration() {
    const { historyList } = this.props;
    return (historyList && historyList.duration) || 0;
  }
  get file() {
    return this.fragments[this.activeItem].file;
  }
  get activeItem() {
    if (this.historyListChanged) {
      this.historyListChanged = false;
      return this.getFirstActiveItem();
    }
    return this.state.activeItem;
  }
  set activeItem(value) {
    let k = 0;
    if (!this.fragments[value]) {
      return;
    }
    while (!this.fragments[value].file) {
      k++;
      if (value === this.fragments.length - 1) {
        value = 0;
      } else {
        value++;
      }
      if (k > this.fragments.length) {
        //最后一个视频是断点（即无视频）
        // this.setState({ end: true });
        break;
      }
    }
    this.setState({ activeItem: value });
    //重置
    this.storage.defaultCurrentTime = 0;
    if (window.historyVideoCurrentTime) {
      window.historyVideoCurrentTime = 0;
    }
  }
  setActiveItem = value => {
    this.activeItem = value;
  };
  //给timeSrlider，存放一些变量
  storage = { defaultCurrentTime: 0 };
  renderSlider() {
    const {
      historyList: { beginDate },
    } = this.props;
    return (
      <TimeSlider
        fragments={this.fragments}
        duration={this.duration}
        beginDateTime={+new Date(beginDate.replace(/-/g, '/')) / 1000}
        storage={this.storage}
        activeItem={this.activeItem}
        setActiveItem={this.setActiveItem}
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
      ...other
    } = this.props;
    const containerStyle = this.getContainerStyle();
    if (!historyList) {
      return (
        <div className="html5-player-container" style={containerStyle}>
          <div className="html5-player-error-message-container">
            {!noneVideoComponent && '请选择有视频的时间段'}
            {noneVideoComponent}
          </div>
        </div>
      );
    }
    return (
      <Player
        {...other}
        file={this.file}
        controls={{ ...controls, timeSlider: false, time: false }}
        customTimeSlider={this.renderSlider()}
        autoplay={true}
        defaultCurrentTime={this.storage.defaultCurrentTime}
      />
    );
  }
}
