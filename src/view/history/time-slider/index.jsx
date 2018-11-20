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
import { namespace as historyNamespace } from '../../../model/history';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    sliderModel: state[timeSliderNamespace],
    selection: state[selectionNamespace],
    isError: !!state[errorNamespace].message,
    historyState: state[historyNamespace],
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
  get isSeekingDisabled() {
    const { selection } = this.props;
    if (selection && selection.seekingDisabled) {
      return true;
    }
    return false;
  }
  onSliderChange = percent => {
    if (this.isSeekingDisabled) {
      return;
    }
    this.dispatch({
      type: `${historyNamespace}/setSliderPercent`,
      payload: {
        percent,
      },
    });
  };
  onMouseDown = e => {
    if (this.isSeekingDisabled) {
      return;
    }
    this.dispatch({
      type: `${videoNamespace}/seekingState`,
      payload: true,
    });
  };
  onMouseUp = e => {
    if (this.isSeekingDisabled) {
      return;
    }
    this.dispatch({
      type: `${videoNamespace}/seekingState`,
      payload: false,
    });
  };
  get duration() {
    let { duration, sliderModel } = this.props;
    const { duration: currentVideoDuration = 0 } = sliderModel;
    if (currentVideoDuration > duration) {
      //只有一个视频的时候，会存在误差
      duration = currentVideoDuration;
    }
    return duration;
  }
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
    const { selection } = this.props;
    if (!selection) {
      return false;
    }
    let { begin, end } = selection;
    let duration = this.duration;
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
  render() {
    let {
      fragments,
      beginDateTime,
      selection,
      isError,
      historyState: { percent },
    } = this.props;
    let duration = this.duration;
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

            let width = gap / duration * 100 + '%';
            if (fragments.length === k + 1) {
              //这样才会覆盖整个slider
              width = (gap / duration + 0.1) * 100 + '%';
            }
            const left = v.begin / duration * 100 + '%';
            const style = {
              left,
              width,
            };
            return (
              <div
                key={k}
                className={classnames({
                  'html5-player-broken': !v.file,
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
