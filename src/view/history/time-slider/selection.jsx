//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
//内部依赖包
import addEventListener from '../../../utils/dom/addEventListener';

export default class Selection extends React.Component {
  static propTypes = {};
  static displayName = 'Selection';
  static contextTypes = {
    timeSliderDOM: PropTypes.object,
  };
  state = {};
  dispatch = this.props.dispatch;
  componentDidMount() {
    this.selectionDOM = ReactDOM.findDOMNode(this.refs['selection']);
    this.document = this.selectionDOM.ownerDocument;
    this.bindEvents();
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
  setSliderValueByPercent(percent = 0) {
    this.percent = percent;
  }
  events = [];
  bindEvents() {
    //像mousemove、mousedown、mouseup等事件，直接使用jsx绑定方式，在高德地图上的tooltip会失效。
    this.events.push(
      addEventListener(this.selectionDOM, 'mousedown', this.onMouseDown)
    );
    this.events.push(
      addEventListener(this.selectionDOM, 'mouseup', this.onMouseUp)
    );
  }
  removeEvents() {
    //移除事件
    this.events.forEach(v => {
      v.remove && v.remove();
    });
  }
  eventsAfterMouseDown = [];
  bindEventsAfterMouseDown() {
    const timeSliderDOM = this.context.timeSliderDOM.children[0];
    this.eventsAfterMouseDown.push(
      addEventListener(this.document, 'mousemove', this.onMouseMove)
    );
    this.eventsAfterMouseDown.push(
      addEventListener(this.document, 'mouseup', this.onMouseUp)
    );
    this.eventsAfterMouseDown.push(
      addEventListener(timeSliderDOM, 'onMouseMove', this.onMouseMove)
    );
  }
  removeEventsAfterMouseDown() {
    //移除事件
    this.eventsAfterMouseDown.forEach(v => {
      v.remove && v.remove();
    });
  }
  getSliderStart() {
    const slider = this.context.timeSliderDOM.children[0];
    const rect = slider.getBoundingClientRect();
    return rect.left;
  }
  calcValueByPos(position) {
    const pixelOffset = position - this.getSliderStart();
    return pixelOffset;
  }
  onStart(position) {
    let value = this.calcValueByPos(position);
    const timeSliderDOM = this.context.timeSliderDOM.children[0];
    const sliderLength = timeSliderDOM.clientWidth;
    if (value < 0) {
      value = 0;
    }
    if (value > sliderLength) {
      value = sliderLength;
    }
    let percent = value / sliderLength;

    const { defaultPercent } = this.props;
    if (defaultPercent || defaultPercent === 0) {
      this.percent = percent;
      this.setState({ random: Math.random() });
    }
    this.onChange(percent);
  }
  onChange = percent => {
    const { onChange } = this.props;
    onChange && onChange(percent);
  };
  onBlur = percent => {
    const { onBlur } = this.props;
    onBlur && onBlur(percent);
  };
  onMouseDown = e => {
    e.stopPropagation();
    this.bindEventsAfterMouseDown();
  };
  onMouseUp = e => {
    e.stopPropagation();
    this.removeEventsAfterMouseDown();
    this.onBlur(this.percent);
  };
  onMouseMove = e => {
    this.onStart(e.pageX);
  };
  render() {
    let { percent, defaultPercent, children, ...other } = this.props;
    if (this.percent === undefined) {
      this.percent = percent || defaultPercent || 0;
    }
    const style = {
      ...this.props.style,
    };
    style.left = `${this.percent * 100}%`;
    return (
      <div {...other} style={style} ref="selection">
        {children}
      </div>
    );
  }
}
