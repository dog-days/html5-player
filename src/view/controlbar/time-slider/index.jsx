//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../../decorator/clear';
import Slider from '../../components/slider';
import TimeTooltip from '../../controlbar/time-tooltip';
import Selection from './selection';
import { namespace as vidoeNamespace } from '../../../model/video';
import { namespace as timeSliderNamespace } from '../../../model/time-slider';
import { namespace as fragmentNamespace } from '../../../model/fragment';
import { namespace as selectionNamespace } from '../../../model/selection';
import { namespace as errorNamespace } from '../../../model/error-message';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    sliderModel: state[timeSliderNamespace],
    fragment: state[fragmentNamespace],
    selection: state[selectionNamespace],
    isError: !!state[errorNamespace].message,
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
  onSliderChange = percent => {
    this.dispatch({
      type: `${vidoeNamespace}/seeking`,
      payload: {
        percent,
      },
    });
  };
  onMouseDown = e => {
    this.dispatch({
      type: `${vidoeNamespace}/seekingState`,
      payload: true,
    });
  };
  onMouseUp = e => {
    this.dispatch({
      type: `${vidoeNamespace}/seekingState`,
      payload: false,
    });
  };
  onLeftSelectionBlur = percent => {
    this.dispatch({
      type: `${vidoeNamespace}/selection`,
      payload: {
        type: 'left-blur',
        percent,
      },
    });
  };
  onLeftSelectionChange = percent => {
    this.dispatch({
      type: `${vidoeNamespace}/selection`,
      payload: {
        type: 'left-change',
        percent,
      },
    });
  };
  onRightSelectionChange = percent => {
    this.dispatch({
      type: `${vidoeNamespace}/selection`,
      payload: {
        type: 'right-change',
        percent,
      },
    });
  };
  onRightSelectionBlur = percent => {
    this.dispatch({
      type: `${vidoeNamespace}/selection`,
      payload: {
        type: 'right-blur',
        percent,
      },
    });
  };
  /**
   * 在有fragment的前提下，渲染可以选择播放的操作按钮
   */
  renderSelection() {
    let {
      selection: { begin, end },
      fragment,
    } = this.props;
    if (end > fragment.duration) {
      end = fragment.duration;
    }
    const leftPercent = begin / fragment.duration;
    const rightPercent = end / fragment.duration;
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
    const {
      sliderModel,
      fragment,
      timeSliderShowFormat,
      hasFragment,
      selection,
      isError,
    } = this.props;
    const { percent, buffer } = sliderModel;
    const bufferStyle = {};
    if (buffer) {
      bufferStyle.width = buffer * 100 + '%';
    }
    if (isError) {
      return false;
    }
    return (
      <Slider
        ref="slider"
        onChange={this.onSliderChange}
        percent={fragment.percent || percent}
        padding="0 10px"
        className={classnames('html5-player-time-slider', {
          'html5-player-track-history-slider': hasFragment,
        })}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onlyShowCircleOnEnter
      >
        {fragment && selection && this.renderSelection()}
        {fragment &&
          fragment.data &&
          fragment.data.map((v, k) => {
            const width = v.gap / fragment.duration * 100 + '%';
            const left = v.begin / fragment.duration * 100 + '%';
            const style = {
              left,
              width,
            };
            return (
              <div key={k} className="html5-player-broken" style={style} />
            );
          })}
        <div className="html5-player-buffer" style={bufferStyle} />
        <TimeTooltip timeSliderShowFormat={timeSliderShowFormat} />
      </Slider>
    );
  }
}
