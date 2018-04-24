//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isNumber from 'lodash/isNumber';
//内部依赖包
import addEventListener from '../../utils/dom/addEventListener';
import contains from '../../utils/dom/contains';
import { cloneElement } from '../../utils/util';

export default class Tooltip extends React.Component {
  displayName = 'Tooltip';
  static propTypes = {
    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
      PropTypes.element,
    ]),
    //是否一直显示。
    show: PropTypes.bool,
    //离目标的上下距离
    toTargetGap: PropTypes.number,
    percent: PropTypes.number,
    defaultPercent: PropTypes.number,
    //触发行为，可选 hover/focus/click，默认hover
    trigger: PropTypes.string,
  };
  state = {
    show: false,
  };
  dispatch = this.props.dispatch;
  eventLists = [];
  componentDidMount() {
    this.moveTargetDOM = ReactDOM.findDOMNode(this.refs.moveTarget);
    //在高德地图中，react jsx绑定事件失效，这种绑定方式没问题。
    this.eventLists.push(
      addEventListener(this.moveTargetDOM, 'mousemove', this.onMouseMove)
    );
    this.eventLists.push(
      addEventListener(this.moveTargetDOM, 'mouseover', this.onMouseOver)
    );
    this.eventLists.push(
      addEventListener(this.moveTargetDOM, 'mouseleave', this.onMouseLeave)
    );
  }
  componentWillReceiveProps(nextProps) {
    if (isNumber(nextProps.percent)) {
      this.percent = nextProps.percent;
    }
  }
  componentWillUnmount() {
    this.documentClickEvent && this.documentClickEvent.remove();
    this.eventLists.forEach(v => {
      v.remove();
    });
  }
  getTargetHeight() {
    const moveTargetDOM = this.moveTargetDOM;
    if (!moveTargetDOM) {
      return 0;
    }
    return moveTargetDOM.clientHeight;
  }
  getTargetLength() {
    const moveTargetDOM = this.moveTargetDOM;
    if (!moveTargetDOM) {
      return 0;
    }
    return moveTargetDOM.clientWidth;
  }
  getTargetStart() {
    const moveTargetDOM = this.moveTargetDOM;
    const rect = moveTargetDOM.getBoundingClientRect();
    return rect.left;
  }
  calcValueByPos(position) {
    const pixelOffset = position - this.getTargetStart();
    return pixelOffset;
  }
  getMousePosition(e) {
    return e.pageX;
  }
  onMouseMove = e => {
    const childProps = this.getChildProps();
    childProps.onMouseMove && childProps.onMouseMove(e);
    const { onChange, percent: propPercent, defaultPercent } = this.props;
    if (isNumber(propPercent) || isNumber(defaultPercent)) {
      const position = this.getMousePosition(e);
      const pixelOffset = this.calcValueByPos(position);
      const length = this.getTargetLength();
      const percent = pixelOffset / length;
      this.percent = percent;
      onChange && onChange(percent);
      if (!isNumber(propPercent)) {
        //否则触发当前组件更新
        this.setState({ random: Math.random() });
      }
    }
  };
  onClick = e => {
    const { trigger = 'hover' } = this.props;
    const childProps = this.getChildProps();
    childProps.onClick && childProps.onClick(e);
    const { show } = this.state;
    if (trigger !== 'click') {
      return;
    }
    if (!show) {
      this.documentClickEvent = addEventListener(
        this.moveTargetDOM.ownerDocument,
        'mousedown',
        e => {
          if (!contains(this.moveTargetDOM, e.target)) {
            this.setState({
              show: false,
            });
            this.documentClickEvent.remove();
          }
        }
      );
    }
    this.setState({
      show: !show,
    });
  };
  onMouseOver = e => {
    const childProps = this.getChildProps();
    childProps.onMouseOver && childProps.onMouseOver(e);
    const { trigger = 'hover' } = this.props;
    if (trigger !== 'hover') {
      return;
    }
    //因为react原生的onMouseEnter有bug，所以自己处理
    var parent = e.relatedTarget; //上一响应mouseover/mouseout事件的元素
    while (parent !== e.currentTarget && parent) {
      //假如存在这个元素并且这个元素不等于目标元素（被赋予mouseenter事件的元素）
      try {
        parent = parent.parentNode || parent.parentElement;
      } catch (e) {
        //上一响应的元素开始往上寻找目标元素
        break;
      }
    }
    if (parent !== e.currentTarget) {
      this.setState({
        show: true,
      });
    }
  };
  onMouseLeave = e => {
    const childProps = this.getChildProps();
    childProps.onMouseLeave && childProps.onMouseLeave(e);
    const { trigger = 'hover' } = this.props;
    if (trigger !== 'hover') {
      return;
    }
    this.setState({
      show: false,
    });
  };
  percent = isNumber(this.props.defaultPercent)
    ? this.props.defaultPercent
    : null;
  getContainerStyle() {
    const { toTargetGap = 0 } = this.props;
    if (!this.refs['tooltip-container']) {
      return {};
    }
    const contentWidth = this.refs['tooltip-container'].clientWidth;
    //const contentHeight = this.refs['tooltip-container'].clientHeight;
    const targetWidth = this.getTargetLength();
    const targetHeight = this.getTargetHeight();
    const contentContainerStyle = {};
    //const playerConainerRect = this.context.playerConainerDOM.getBoundingClientRect();
    //const playerConainerWidth = playerConainerRect.width;
    if (isNumber(this.percent) && targetWidth) {
      const pixelOffset = this.percent * targetWidth;
      if (pixelOffset + contentWidth / 2 > targetWidth) {
        //位置不能超过tooltip的目标元素长度
        contentContainerStyle.left =
          (targetWidth - contentWidth / 2) / targetWidth * 100 + '%';
      } else if (pixelOffset <= contentWidth / 2) {
        //位置不能小于tooltip的目标元素长度
        contentContainerStyle.left = contentWidth / 2 / targetWidth * 100 + '%';
      } else {
        contentContainerStyle.left = this.percent * 100 + '%';
      }
      contentContainerStyle.transform = 'translate(-50%, 0%)';
    } else {
      contentContainerStyle.left = `${targetWidth / 2}px`;
      contentContainerStyle.transform = 'translate(-50%, 0%)';
    }
    contentContainerStyle.paddingBottom = `${toTargetGap}px`;
    contentContainerStyle.bottom = `${targetHeight}px`;
    return contentContainerStyle;
  }
  renderTooltipContent() {
    const { content, show: propsShow, className } = this.props;
    let { show } = this.state;
    if (propsShow) {
      show = propsShow;
    }
    const contentContainerStyle = this.getContainerStyle();
    const tooltipContainer = (
      <div
        key="content"
        onClick={e => {
          e.stopPropagation();
        }}
        ref="tooltip-container"
        className={classnames(
          'html5-player-tooltip-content-container',
          {
            'html5-player-hide': !show,
            'html5-player-show': show,
          },
          className
        )}
        style={contentContainerStyle}
      >
        {content}
      </div>
    );

    return tooltipContainer;
  }
  getChildProps() {
    const { children } = this.props;
    //preact;
    let childProps = (children[0] || children).attributes;
    if (!childProps) {
      childProps = (children[0] || children).props;
    }
    return childProps;
  }
  render() {
    const { children } = this.props;
    return cloneElement(
      children,
      {
        onClick: this.onClick,
        style: { position: 'relative' },
        ref: 'moveTarget',
      },
      this.renderTooltipContent()
    );
  }
}
