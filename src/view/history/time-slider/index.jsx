//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../../decorator/clear';
import Slider from '../../components/slider';
import TimeTooltip from './time-tooltip';
import Selection from './selection';
import { namespace as videoNamespace } from '../../../model/video';
import { namespace as timeSliderNamespace } from '../../../model/time-slider';
import { namespace as selectionNamespace } from '../../../model/selection';
import { namespace as errorNamespace } from '../../../model/error-message';
import { namespace as endNamespace } from '../../../model/end';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    sliderModel: state[timeSliderNamespace],
    selection: state[selectionNamespace],
    isError: !!state[errorNamespace].message,
    end: state[endNamespace],
  };
})
@clearDecorator([timeSliderNamespace])
export default class TimeSlider extends React.Component {
  static propTypes = {};
  static displayName = 'TimeSlider';
  static contextTypes = {
    leftSelectionComponent: PropTypes.element,
    rightSelectionComponent: PropTypes.element,
  };
  static childContextTypes = {
    timeSliderDOM: PropTypes.object,
  };
  getChildContext() {
    return {
      timeSliderDOM: this.timeSliderDOM,
    };
  }
  state = {};
  dispatch = this.props.dispatch;
  componentDidMount() {
    this.timeSliderDOM = ReactDOM.findDOMNode(this.refs.slider);
  }
  componentDidUpdate() {
    //为了对外提供api，historyCurrentTime
    this.dispatch({
      type: `${videoNamespace}/setHistoryCurrentTime`,
      payload: {
        historyCurrentTime: this.percent * this.props.duration,
      },
    });
  }
  componentWillUnmount() {
    console.log(222);
    window.historyVideoCurrentTime = 0;
  }
  onSliderChange = percent => {
    const { duration, activeItem, fragments, storage } = this.props;
    const currentTime = percent * duration;
    //当前播放的currentTime，需要转换
    let currentVideoTime = currentTime;
    this.selectedItem = activeItem;
    fragments.forEach((v, k) => {
      if (v.begin < currentTime && v.end > currentTime) {
        //切换视频会用到
        this.selectedItem = k;
        return;
      }
    });
    fragments.forEach((v, k) => {
      //这个循环需要等待selected赋值后处理，即上面的循环处理
      const gaps = v.end - v.begin;
      if (this.selectedItem > k) {
        currentVideoTime -= gaps;
      }
    });
    //存储storage
    storage.lastPercent = percent;
    this.setState({
      percent,
    });
    //begin----处理当前video的进度
    const broken = !fragments[this.selectedItem].file;
    if (broken) {
      //拖动到broken或者点击到broken处（即无视频处）
      currentVideoTime = 0;
    }
    this.currentVideoTime = currentVideoTime;

    //end----处理当前video的进度
  };
  onMouseDown = e => {
    this.hasbeenClick = true;
    this.dispatch({
      type: `${videoNamespace}/seekingState`,
      payload: true,
    });
    this.setState({
      isSliding: true,
    });
  };
  onMouseUp = e => {
    this.setState({
      isSliding: false,
    });
    const { storage, setActiveItem, activeItem, sliderModel } = this.props;
    const { duration: currentVideoDuration = 0 } = sliderModel;
    this.dispatch({
      type: `${videoNamespace}/seeking`,
      payload: {
        percent: this.currentVideoTime / currentVideoDuration,
      },
    });
    //video/event/index.js中loadeddata事件中使用。
    window.historyVideoCurrentTime = this.currentVideoTime;
    if (activeItem !== this.selectedItem) {
      //拖动或者点击slider，选中的item不一样，需要切换item进行播放
      setActiveItem(this.selectedItem);
      //视频切换需要设置defaultCurrentTime，setActiveItem会先重置defaultCurrentTime=0。
      storage.defaultCurrentTime = this.currentVideoTime;
    }
    if (this.selectedItem !== 0) {
      this.setState({
        percent: 0,
      });
    }
    this.dispatch({
      type: `${videoNamespace}/seekingState`,
      payload: false,
    });
  };
  duration = this.props.duration;
  onLeftSelectionBlur = percent => {
    this.dispatch({
      type: `${videoNamespace}/selection`,
      payload: {
        type: 'left-blur',
        percent,
        duration: this.duration,
      },
    });
  };
  onLeftSelectionChange = percent => {
    this.dispatch({
      type: `${videoNamespace}/selection`,
      payload: {
        type: 'left-change',
        percent,
        duration: this.duration,
      },
    });
  };
  onRightSelectionChange = percent => {
    this.dispatch({
      type: `${videoNamespace}/selection`,
      payload: {
        type: 'right-change',
        percent,
        duration: this.duration,
      },
    });
  };
  onRightSelectionBlur = percent => {
    this.dispatch({
      type: `${videoNamespace}/selection`,
      payload: {
        type: 'right-blur',
        percent,
        duration: this.duration,
      },
    });
  };
  /**
   * 在有fragment的前提下，渲染可以选择播放的操作按钮
   */
  renderSelection() {
    let {
      selection: { begin, end },
      duration,
    } = this.props;
    if (end > duration) {
      end = duration;
    }
    const leftPercent = begin / duration;
    const rightPercent = end / duration;
    return (
      <span className="html5-player-selection-container">
        <Selection
          className="html5-player-selection-left"
          percent={leftPercent}
          onBlur={this.onLeftSelectionBlur}
          onChange={this.onLeftSelectionChange}
        >
          {this.context.leftSelectionComponent}
        </Selection>
        <Selection
          percent={rightPercent}
          className="html5-player-selection-right"
          onChange={this.onRightSelectionChange}
          onBlur={this.onRightSelectionBlur}
        >
          {this.context.rightSelectionComponent}
        </Selection>
      </span>
    );
  }
  getPercent() {
    const {
      sliderModel,
      fragments,
      duration,
      activeItem,
      storage,
      end,
    } = this.props;
    //currentVideoDuration当前播放视频的duration
    const {
      percent: currentVideoPercent = 0,
      duration: currentVideoDuration = 0,
    } = sliderModel;
    if (
      (currentVideoPercent === 0 || currentVideoDuration === 0) &&
      activeItem > 0
    ) {
      //切换视频初始化时(获取数据)，返回上一个percent
      //这样才能位置进度不变，要不会变成进度为0，然后视频加载成功后跳跃到播放位置，这样就很奇怪
      return storage.lastPercent || 0;
    }
    if (
      //slider拖动中
      this.state.isSliding ||
      //下面的条件判断，处理切换到第一个视频初始化时，进度为0的问题
      (activeItem === 0 && currentVideoPercent === 0)
    ) {
      return this.state.percent || 0;
    }
    // console.log(currentVideoPercent);
    let percent = 0;
    //当前播放的视频的当前播放时长
    let currentVideoTime = currentVideoPercent * currentVideoDuration;
    if (
      currentVideoTime === currentVideoDuration &&
      activeItem < fragments.length &&
      !end
    ) {
      //处理当前视频播放结束切换下一个视频时，currentVideoTime还等于上一个的duration问题。
      currentVideoTime = 0;
    }
    if (window.historyVideoCurrentTime) {
      window.historyVideoCurrentTime = 0;
    }
    // console.log(window.historyVideoCurrentTime);
    let currentTime = 0;
    currentTime += currentVideoTime;
    fragments.forEach((v, k) => {
      if (activeItem > k) {
        let gap = v.end - v.begin;
        currentTime += gap;
      }
    });
    percent = currentTime / duration;
    storage.lastPercent = percent;
    return percent;
  }
  render() {
    const {
      fragments,
      duration,
      beginDateTime,
      selection,
      isError,
    } = this.props;
    // this.setStorage();
    const percent = this.getPercent();
    this.percent = percent;
    return (
      <Slider
        ref="slider"
        onChange={this.onSliderChange}
        percent={percent}
        padding="0 10px"
        className={classnames(
          'html5-player-time-slider',
          'html5-player-track-history-slider',
          {
            'html5-player-hide': isError,
          }
        )}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onlyShowCircleOnEnter
      >
        {selection && this.renderSelection()}
        {fragments &&
          fragments.map((v, k) => {
            let gap = v.end - v.begin;
            if (fragments.length === k + 1) {
              //最后一个加多一个1，这样才会覆盖整个slider
              gap += 1;
            }
            const width = gap / duration * 100 + '%';
            const left = v.begin / duration * 100 + '%';
            const style = {
              left,
              width,
            };
            return (
              <div
                key={k}
                className={classnames('html5-player-broken', {
                  'html5-player-hasvideo': v.file,
                })}
                style={style}
              />
            );
          })}
        <TimeTooltip duration={duration} beginDateTime={beginDateTime} />
      </Slider>
    );
  }
}
