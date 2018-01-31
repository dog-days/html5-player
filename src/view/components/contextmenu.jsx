//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
//内部依赖包
import addEventListener from '../../utils/dom/addEventListener';
import contains from '../../utils/dom/contains';
import { cloneElement } from '../../utils/util';

export default class ContextMenu extends React.Component {
  displayName = 'ContextMenu';
  static propTypes = {
    content: PropTypes.element,
    //overflow 是否不能超出容器的边界，默认可以超出
    overflow: PropTypes.bool,
  };
  state = { showMenu: false };
  renderContextmenu() {
    const { content } = this.props;
    const { showMenu, left, top } = this.state;
    return cloneElement(content, {
      key: 'menu',
      ref: 'menu',
      style: {
        visibility: showMenu ? 'visible' : 'hidden',
        color: 'red',
        position: 'absolute',
        whiteSpace: 'nowrap',
        zIndex: 100000,
        left,
        top,
      },
    });
  }
  onContextMenu = e => {
    e.preventDefault();
    //overflow 是否不能超出容器的边界
    const { overflow = true } = this.props;
    const containerTarget = ReactDOM.findDOMNode(this.refs.containerTarget);
    const menuDOM = ReactDOM.findDOMNode(this.refs.menu);
    const body = containerTarget.ownerDocument.body;
    const containerTargetRect = containerTarget.getBoundingClientRect();
    const menuDOMRect = menuDOM.getBoundingClientRect();
    let left = parseInt(`${e.pageX - containerTargetRect.left}`, 10);
    let top = parseInt(`${e.pageY - containerTargetRect.top}`, 10);
    // console.log(body.clientWidth, left, e.pageX);
    if (!overflow) {
      //overflow 是否不能超出容器的边界
      if (left > containerTargetRect.width - menuDOMRect.width) {
        //超过container右边
        left = containerTargetRect.width - menuDOMRect.width;
      }
      if (top > containerTargetRect.height - menuDOMRect.height) {
        //超过container右边
        top = containerTargetRect.height - menuDOMRect.height;
      }
    } else {
      if (e.pageX > body.clientWidth - menuDOMRect.width) {
        //超过浏览器右边
        left = body.clientWidth - menuDOMRect.width - containerTargetRect.left;
      }
      if (e.pageY > body.clientHeight - menuDOMRect.height) {
        //超过浏览器底部
        top = body.clientHeight - menuDOMRect.height - containerTargetRect.top;
      }
    }
    this.setState({
      showMenu: true,
      left: `${left}px`,
      top: `${top}px`,
    });
    this.documentMousedownEvent && this.documentMousedownEvent.remove();
    this.documentMousedownEvent = addEventListener(
      containerTarget.ownerDocument,
      'mousedown',
      e => {
        if (!contains(menuDOM, e.target)) {
          this.documentMousedownEvent.remove();
          this.setState({
            showMenu: false,
          });
        }
      }
    );
  };
  render() {
    const { children } = this.props;
    return cloneElement(
      children,
      {
        ref: 'containerTarget',
        onContextMenu: this.onContextMenu,
      },
      this.renderContextmenu()
    );
  }
}
