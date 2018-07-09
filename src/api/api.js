import isString from 'lodash/isString';
import addEventListener from '../utils/dom/addEventListener';
import * as util from '../utils/util';
//使用的是backbone event
//外api的事件，内部数据流只使用redux
import event from '../utils/event';

/**
 * 拥有所有的video dom对象的属性和方法，
 * 同时添加或者改造了新属性和方法。
 * 添加新的自定义事件
 * 事件监控需要使用on，不使用addEventListener方式
 * @this { boolean } loading 加载中（新增属性）
 * @this { boolean } playing 播放中（新增属性）
 * @this { boolean } living 是否是直播
 * @this { number } bufferTime buffer秒数（新增属性）
 * @this { boolean } isError 是否展示错误信息，这个属性在model/vidoe中设置的
 * @this { boolean } onControlbarEnter 鼠标是否在controlbar上，这个属性在model/vidoe中设置的
 * @this { boolean } seekingState 是否在seeking，timeline点击拖动也是在seeking，这个跟原生的有点不一样。
 * @this { boolean } notAutoPlayViewHide 当autoplay为false时，这个属性false为notAutoPlay页面展示，否则隐藏
 * @this { boolean } controlbarShow true controlbar显示，false controlbar 隐藏，这个属性在model/vidoe中设置的
 * @this { number } videoGaps 断片累加值，也是记录值
 * @this { number } currentSubtitleTrack 当前选择的字幕
 * @this { boolean } reloading 是否在重载
 *    //合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
 *    //但是这个视频不是整个时段的，会有断的，为了给用户知道这段录像哪里断了，需要而外处理
 *    //这里是为了算出播放中，遇到断片的情况
 */
export default class API {
  constructor(videoDOM, file) {
    this.videoDOM = videoDOM;
    this.file = file;
    //绑定自定义事件处理方法
    this.event = {
      ...event,
    };
    let _this = this;
    try {
      //这里把vidoeDOM里面的的大部分属性和方法，都绑在了this中。
      for (let k in videoDOM) {
        if (
          k === 'webkitDisplayingFullscreen' ||
          k === 'webkitSupportsFullscreen'
        ) {
          continue;
        }
        //方法处理
        if (
          Object.prototype.toString.apply(videoDOM[k]) === '[object Function]'
        ) {
          let oldKey = k;
          if (_this[k]) {
            //如果API中定义了该属性，则添加前缀
            k = '_' + k;
          }
          this[k] = function(...param) {
            videoDOM[oldKey](...param);
          };
        } else {
          //属性处理
          if (_this[k]) {
            //如果API中定义了该属性，则添加前缀
            k = '_' + k;
          }
          _this = Object.create(_this, {
            [k]: {
              get: function() {
                return videoDOM[k];
              },
              set: function(val) {
                videoDOM[k] = val;
              },
            },
          });
          //自定义新属性
          switch (k) {
            case 'paused':
              _this = Object.create(_this, {
                playing: {
                  get: function() {
                    return !videoDOM[k];
                  },
                  set: function(val) {
                    videoDOM[k] = !val;
                  },
                },
              });
              break;
            case 'buffered':
              _this = Object.create(_this, {
                bufferTime: {
                  // eslint-disable-next-line
                  get: function() {
                    return _this.getBufferTime();
                  },
                },
              });
              break;
            case 'duration':
              _this = Object.create(_this, {
                duration: {
                  // eslint-disable-next-line
                  get: function() {
                    return _this.fragmentDuration || videoDOM.duration;
                  },
                },
              });
              break;
            default:
          }
        }
      }
    } catch (e) {
      //nothing
    }
    return _this;
  }
  //默认值
  videoGaps = 0;
  seekingState = false;
  //载入视频源，这里不可以用箭头函数
  play() {
    if (!this.playing) {
      this._play();
    }
  }
  pause() {
    if (this.playing) {
      this._pause();
    }
  }
  setVolume(volume) {
    if (!this.muted) {
      this.volume = volume;
    }
  }
  //获取buffer的秒数
  getBufferTime() {
    var buf = this.buffered;
    var total = 0;
    for (let ii = 0; ii < buf.length; ii++) {
      total += buf.end(ii) - buf.start(ii);
    }
    return total;
  }
  //重置api一些值
  reset() {
    this.videoGaps = 0;
  }
  /**
   * 监控事件
   * @param { string } type 事件类型
   * @param { function } callback 回调函数
   */
  on(dom, type, callback) {
    if (isString(dom)) {
      callback = type;
      type = dom;
      dom = this;
    }
    //自定义事件和dom事件一起绑定了，这里不做判断有没有type类型的dom事件
    const event = addEventListener(dom, type, callback);
    //自定义事件
    this.event.on(type, callback);
    //remove适配
    const eventListIndex = util.randomKey();
    if (!this.eventList) {
      this.eventList = {};
    }
    if (!this.eventList[type]) {
      this.eventList[type] = {};
    }
    this.eventList[type][eventListIndex] = event;
    //这个remove是给当前事件解绑使用
    const returnRemove = () => {
      this.eventList[type][eventListIndex] &&
        this.eventList[type][eventListIndex].remove();
      //删除移除指定的this.eventList[type]
      delete this.eventList[type][eventListIndex];
      //移除当前自定义事件
      this.event.off(type, callback);
    };
    //返回的事件对像只能移除当前监听的事件。
    return {
      off: returnRemove,
    };
  }
  /**
   * 移除指定或者全部监控事件，包括多次绑定的事件
   * @param { string || undefined || array } type 事件类型
   */
  off(type) {
    if (type === undefined) {
      //移除全部事件
      for (let k in this.eventList) {
        for (let j in this.eventList[k]) {
          this.eventList[k][j].remove();
        }
      }
      this.eventList = {};
      //移除全部自定义事件
      this.event.off();
    } else if (Object.prototype.toString.apply(type) === '[object Array]') {
      //移除部分事件
      type.forEach(v => {
        for (let j in this.eventList[v]) {
          this.eventList[v][j].remove();
        }
        delete this.eventList[v];
      });
    } else {
      //移除一个事件
      for (let j in this.eventList[type]) {
        this.eventList[type][j].remove();
      }
      delete this.eventList[type];
      //移除自定义事件
      this.event.off(type);
    }
  }
  //触发自定义事件
  trigger(name, ...params) {
    return this.event.trigger(name, ...params);
  }
}
