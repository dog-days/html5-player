//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
//内部依赖包
import Player from '../../index';
import TimeSlider from './time-slider';

export default class HistoryPlayer extends React.Component {
  static displayName = 'HistoryPlayer ';
  static propTypes = {
    historyList: PropTypes.object.isRequired,
    //当前选择播放的视频源（播放列表中的某项）
    activeItem: PropTypes.number,
  };
  static childContextTypes = {
    playlist: PropTypes.array,
    activeItem: PropTypes.number,
    setActiveItem: PropTypes.func,
    isHistory: PropTypes.bool,
  };
  getChildContext() {
    return {
      playlist: this.fragments,
      activeItem: this.activeItem,
      setActiveItem: this.setActiveItem,
      isHistory: true,
    };
  }
  state = {
    activeItem: 0,
  };
  get fragments() {
    const { historyList } = this.props;
    const fragments =
      historyList && historyList.fragments && historyList.fragments;
    return fragments;
  }
  get duration() {
    const { historyList } = this.props;
    return historyList && (historyList.duration || 0);
  }
  get file() {
    const { activeItem } = this.state;
    return this.fragments[activeItem].file;
  }
  get activeItem() {
    return this.state.activeItem;
  }
  set activeItem(value) {
    let k = 0;
    if (!this.fragments[value]) {
      return;
    }
    while (!this.fragments[value].file) {
      k++;
      value++;
      if (k > this.fragments.length) {
        //最后一个视频是断点（即无视频）
        this.setState({ end: true });
        break;
      }
    }
    this.setState({ activeItem: value });
    //重置
    this.storage.defaultCurrentTime = 0;
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
  render() {
    const { autoplay, controls, ...other } = this.props;
    //     const { activeItem } = this.state;
    // || activeItem === 0 ? autoplay : true
    return (
      <span>
        <Player
          {...other}
          file={this.file}
          controls={{ ...controls, timeSlider: false, time: false }}
          customTimeSlider={this.renderSlider()}
          autoplay={true}
          defaultCurrentTime={this.storage.defaultCurrentTime}
        />
      </span>
    );
  }
}
