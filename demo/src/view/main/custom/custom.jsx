import React from 'react';
import PropTypes from 'prop-types';

export default class View extends React.Component {
  state = {};
  static contextTypes = {
    player: PropTypes.object,
  };
  componentDidMount() {
    const player = this.context.player;
    player.on('loadeddata', () => {
      this.mousewheelEvent(player);
    });
    player.on('timeupdate', () => {
      if (
        ((player.ended || player.isError) && this.state.showArrowControler) ||
        !player.playing
      ) {
        //视频结束或者中途报错
        this.setState({
          showArrowControler: false,
        });
      } else if (player.playing) {
        this.setState({
          showArrowControler: true,
        });
      }
    });
  }
  onMouseDown = type => {
    return e => {
      switch (type) {
        case 'top-left':
          console.log('开始向左上移动');
          break;
        case 'top-middle':
          console.log('开始向上移动');
          break;
        case 'top-right':
          console.log('开始向右上移动');
          break;
        case 'middle-left':
          console.log('开始向左移动');
          break;
        case 'middle-middle':
          break;
        case 'middle-right':
          console.log('开始向右移动');
          break;
        case 'bottom-left':
          console.log('开始向左下移动');
          break;
        case 'bottom-middle':
          console.log('开始向下移动');
          break;
        case 'bottom-right':
          console.log('开始向右下移动');
          break;
        default:
      }
    };
  };
  onMouseUp = type => {
    return e => {
      switch (type) {
        case 'top-left':
          console.log('结束向左上移动');
          break;
        case 'top-middle':
          console.log('结束向上移动');
          break;
        case 'top-right':
          console.log('结束向右上移动');
          break;
        case 'middle-left':
          console.log('结束向左移动');
          break;
        case 'middle-middle':
          if (!this.rotate) {
            console.log('开始旋转');
            this.rotate = true;
          } else {
            console.log('结束旋转');
            this.rotate = false;
          }
          break;
        case 'middle-right':
          console.log('结束向右移动');
          break;
        case 'bottom-left':
          console.log('结束向左下移动');
          break;
        case 'bottom-middle':
          console.log('结束向下移动');
          break;
        case 'bottom-right':
          console.log('结束向右下移动');
          break;
        default:
      }
    };
  };
  mousewheelEvent(player) {
    let mousewheelEvent;
    let mousewheelFirfoxEvent;
    player.on('focus', flag => {
      if (flag) {
        const mousewheelCallback = e => {
          e.preventDefault();
          if (e.nativeEvent.wheelDelta > 0) {
            console.log('摄像机开始放大镜头');
          } else {
            console.log('摄像机开始缩小镜头');
          }
        };
        mousewheelEvent = player.on(document, 'mousewheel', mousewheelCallback);
        //firfox
        mousewheelFirfoxEvent = player.on(
          document,
          'DOMMouseScroll',
          mousewheelCallback
        );
      } else {
        mousewheelEvent && mousewheelEvent.off();
        mousewheelFirfoxEvent && mousewheelFirfoxEvent.off();
      }
    });
  }
  render() {
    const { showArrowControler } = this.state;
    if (!showArrowControler) {
      return false;
    }
    return (
      <div className="camera-control-container">
        <div>
          <div
            className="camera-control-top-left"
            onMouseDown={this.onMouseDown('top-left')}
            onMouseUp={this.onMouseUp('top-left')}
          >
            <span />
          </div>
          <div
            className="camera-control-top-middle"
            onMouseDown={this.onMouseDown('top-middle')}
            onMouseUp={this.onMouseUp('top-middle')}
          >
            <span />
          </div>
          <div
            className="camera-control-top-right"
            onMouseDown={this.onMouseDown('top-right')}
            onMouseUp={this.onMouseUp('top-right')}
          >
            <span />
          </div>
        </div>
        <div>
          <div
            className="camera-control-middle-left"
            onMouseDown={this.onMouseDown('middle-left')}
            onMouseUp={this.onMouseUp('middle-left')}
          >
            <span />
          </div>
          <div
            className="camera-control-middle-middle"
            onMouseDown={this.onMouseDown('middle-middle')}
            onMouseUp={this.onMouseUp('middle-middle')}
          >
            <svg
              className="nan-icon nan-middle-button nan-replay-icon"
              aria-hidden="true"
            >
              <use xlinkHref="#icon-replay" />
            </svg>
          </div>
          <div
            className="camera-control-middle-right"
            onMouseDown={this.onMouseDown('middle-right')}
            onMouseUp={this.onMouseUp('middle-right')}
          >
            <span />
          </div>
        </div>
        <div>
          <div
            className="camera-control-bottom-left"
            onMouseDown={this.onMouseDown('bottom-left')}
            onMouseUp={this.onMouseUp('bottom-left')}
          >
            <span />
          </div>
          <div
            className="camera-control-bottom-middle"
            onMouseDown={this.onMouseDown('bottom-middle')}
            onMouseUp={this.onMouseUp('bottom-middle')}
          >
            <span />
          </div>
          <div
            className="camera-control-bottom-right"
            onMouseDown={this.onMouseDown('bottom-right')}
            onMouseUp={this.onMouseUp('bottom-right')}
          >
            <span />
          </div>
        </div>
      </div>
    );
  }
}
