//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import Slider from '../components/slider';
import TimeTooltip from '../controlbar/time-tooltip';
import { namespace as vidoeNamespace } from '../../model/video';
import { namespace as timeSliderNamespace } from '../../model/time-slider';
import { namespace as fragmentNamespace } from '../../model/fragment';
import { namespace as errorNamespace } from '../../model/error-message';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    sliderModel: state[timeSliderNamespace],
    fragment: state[fragmentNamespace],
    isError: !!state[errorNamespace].message,
  };
})
@clearDecorator([timeSliderNamespace])
export default class TimeSlider extends React.Component {
  static propTypes = {};
  displayName = 'TimeSlider';
  state = {};
  dispatch = this.props.dispatch;
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
  render() {
    const {
      sliderModel,
      fragment,
      timeSliderShowFormat,
      hasFragment,
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
