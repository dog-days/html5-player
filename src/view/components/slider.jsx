//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
//内部依赖包
import addEventListener from '../../utils/dom/addEventListener';

export default class Slider extends React.Component {
  static propTypes = {
    //是否是垂直的
    vertical: PropTypes.bool,
    onChange: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //跟input的一样有default的percent，最大值为1
    percent: PropTypes.number,
    defaultPercent: PropTypes.number,
    //只在移上去的时候显示圆点。
    onlyShowCircleOnEnter: PropTypes.bool,
  };
  displayName = 'Slider';
  state = {};
  dispatch = this.props.dispatch;
  percent = 0;
  componentDidMount() {
    this.sliderDOM = this.refs.slider;
    this.sliderContainerDOM = this.refs['slider-container'];
    this.bindEvents();
    this.document = this.sliderDOM.ownerDocument;
    let { percent, defaultPercent } = this.props;
    if (percent !== undefined || defaultPercent !== undefined) {
      this.setSliderValueByPercent(percent || defaultPercent);
      this.setState({ random: Math.random() });
    }
  }
  componentWillReceiveProps(nextProps) {
    let { percent: nextPercent } = nextProps;
    let { percent: thisPercent } = this.props;
    if (thisPercent || thisPercent === 0) {
      if (nextPercent !== thisPercent) {
        this.setSliderValueByPercent(nextPercent);
      }
    }
  }
  componentWillUnmount() {
    this.removeEvents();
  }
  events = [];
  removeEvents() {
    //移除事件
    this.events.forEach(v => {
      v.remove && v.remove();
    });
  }
  bindEvents() {
    //像mousemove、mousedown、mouseup等事件，直接使用jsx绑定方式，在高德地图上的tooltip会失效。
    this.events.push(
      addEventListener(this.sliderContainerDOM, 'mousedown', this.onMouseDown)
    );
    this.events.push(
      addEventListener(this.sliderContainerDOM, 'mouseup', this.onMouseUp)
    );
  }
  setSliderValueByPercent(percent = 0) {
    this.percent = percent;
  }
  eventsAfterMouseDown = [];
  bindEventsAfterMouseDown() {
    this.eventsAfterMouseDown.push(
      addEventListener(this.document, 'mousemove', this.onMouseMove)
    );
    this.eventsAfterMouseDown.push(
      addEventListener(this.document, 'mouseup', this.onEnd)
    );
    this.eventsAfterMouseDown.push(
      addEventListener(this.sliderContainerDOM, 'mousemove', this.onMouseMove)
    );
  }
  removeEventsAfterMouseDown() {
    //移除事件
    this.eventsAfterMouseDown.forEach(v => {
      v.remove && v.remove();
    });
  }
  getSliderLength() {
    const slider = this.sliderDOM;
    if (!slider) {
      return 0;
    }
    const coords = slider.getBoundingClientRect();
    return this.props.vertical ? coords.height : coords.width;
  }
  getSliderStart() {
    const slider = this.sliderDOM;
    const rect = slider.getBoundingClientRect();
    if (rect.left < slider.offsetLeft || rect.top < slider.offsetTop) {
      return this.props.vertical ? slider.offsetTop : slider.offsetLeft;
    }
    return this.props.vertical ? rect.top : rect.left;
  }
  calcValueByPos(position) {
    const pixelOffset = position - this.getSliderStart();
    return pixelOffset;
  }
  onEnd = e => {
    e.stopPropagation();
    this.removeEventsAfterMouseDown();
    //结束设置isMove为false
    this.onChange(this.percent, false);
    //document和time-line的mouseup都要触发
    const { onMouseUp } = this.props;
    onMouseUp && onMouseUp(e);
  };
  getMousePosition(vertical, e) {
    return vertical ? e.clientY : e.pageX;
  }
  onStart(position, isMove) {
    let value = this.calcValueByPos(position);
    const sliderLength = this.getSliderLength();
    if (value < 0) {
      value = 0;
    }
    if (value > sliderLength) {
      value = sliderLength;
    }
    let percent = value / sliderLength;
    const { defaultPercent, vertical } = this.props;
    if (vertical) {
      percent = 1 - percent;
    }
    if (defaultPercent || defaultPercent === 0) {
      this.percent = percent;
      this.setState({ random: Math.random() });
    }
    this.onChange(percent, isMove);
  }
  onChange = (percent, isMove) => {
    const { onChange } = this.props;
    onChange && onChange(percent, isMove);
  };

  onMouseDown = e => {
    e.stopPropagation();
    const { vertical, onMouseDown } = this.props;
    let position = this.getMousePosition(vertical, e);
    this.removeEventsAfterMouseDown();
    this.onStart(position);
    this.bindEventsAfterMouseDown();
    onMouseDown && onMouseDown(e);
  };
  onMouseUp = e => {
    e.stopPropagation();
    this.onEnd(e);
  };
  onMouseMove = e => {
    e.stopPropagation();
    const { vertical } = this.props;
    let position = this.getMousePosition(vertical, e);
    this.onStart(position, true);
  };
  render() {
    const {
      children,
      vertical,
      width,
      height,
      padding,
      onlyShowCircleOnEnter,
      className,
    } = this.props;
    const containerStyle = {};
    if (width) {
      containerStyle.width = width;
    }
    if (width) {
      containerStyle.height = height;
    }
    if (padding) {
      containerStyle.padding = padding;
    }
    const circleStyle = {};
    const trackStyle = {};
    if (vertical) {
      circleStyle.top = (1 - this.percent) * 100 + '%';
      trackStyle.height = this.percent * 100 + '%';
    } else {
      circleStyle.left = this.percent * 100 + '%';
      trackStyle.width = this.percent * 100 + '%';
    }
    return (
      <div
        ref="slider-container"
        style={containerStyle}
        className={classnames(
          'html5-player-slider-container',
          {
            'html5-player-slider-vertical-container': vertical,
            'html5-player-slider-horizontal-container': !vertical,
          },
          className
        )}
        onClick={e => {
          e.stopPropagation();
        }}
        onDoubleClick={e => {
          e.stopPropagation();
        }}
      >
        <div
          ref="slider"
          className={classnames('html5-player-slider-rail', {
            'html5-player-slider-vertical-rail': vertical,
            'html5-player-slider-horizontal-rail': !vertical,
            'html5-player-slider-onenter-rail': onlyShowCircleOnEnter,
          })}
        >
          {children}
          <div
            style={trackStyle}
            className={classnames('html5-player-slider-track', {
              'html5-player-slider-vertical-track': vertical,
              'html5-player-slider-horizontal-track': !vertical,
            })}
          />
          <div
            style={circleStyle}
            className={classnames('html5-player-slider-circle', {
              'html5-player-slider-vertical-circle': vertical,
              'html5-player-slider-horizontal-circle': !vertical,
            })}
          />
        </div>
      </div>
    );
  }
}
