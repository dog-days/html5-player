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
  setSliderValueByPercent(percent = 0) {
    this.percent = percent;
  }

  addDocumentMouseEvents() {
    this.onMouseMoveListener = addEventListener(
      this.document,
      'mousemove',
      this.onMouseMove
    );
    this.onMouseUpListener = addEventListener(
      this.document,
      'mouseup',
      this.onEnd
    );
  }
  removeDocumentEvents() {
    /* eslint-disable no-unused-expressions */
    //this.onTouchMoveListener && this.onTouchMoveListener.remove();
    //this.onTouchUpListener && this.onTouchUpListener.remove();

    this.onMouseMoveListener && this.onMouseMoveListener.remove();
    this.onMouseUpListener && this.onMouseUpListener.remove();
    /* eslint-enable no-unused-expressions */
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
    return this.props.vertical ? rect.top : rect.left;
  }
  calcValueByPos(position) {
    const pixelOffset = position - this.getSliderStart();
    return pixelOffset;
  }
  onEnd = () => {
    this.removeDocumentEvents();
    //结束设置isMove为false
    this.onChange(this.percent, false);
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
    if (defaultPercent) {
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
    this.removeDocumentEvents();
    this.onStart(position);
    this.addDocumentMouseEvents();
    onMouseDown && onMouseDown(e);
  };
  onMouseUp = e => {
    const { onMouseUp } = this.props;
    e.stopPropagation();
    this.onEnd();
    onMouseUp && onMouseUp(e);
  };
  onMouseMove = e => {
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
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
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
