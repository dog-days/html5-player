import { namespace } from './index';
import { namespace as readyNamespace } from '../ready';
import {
  HAVE_CURRENT_DATA,
  HAVE_FUTURE_DATA,
  HAVE_ENOUGH_DATA,
  VIDEO_TIMEOUT,
  LIVING_MAXBUFFER_TIME,
  RETRY_TIMES,
} from '../../utils/const';
import * as logger from '../../utils/logger';

import { TIMEOUT_ERROR } from '../../utils/error-code';
import { isIE } from '../../utils/browser';
import contains from '../../utils/dom/contains';
import localization from '../../i18n/default';

class Events {
  constructor(payload) {
    this.api = payload.api;
    this.dispatch = payload.dispatch;
    this.config = payload.config;
    this.loadeddata();
    this.timeupdate();
    this.pause();
    this.error();
    this.ended();
    this.stalled();
    this.onSpaceAndVieoFocusEvent();
    logger.info('Listening:', 'listening on h5 video events.');
  }
  reset() {
    clearTimeout(this.videoTimeout);
  }
  loadeddata() {
    const api = this.api;
    const dispatch = this.dispatch;
    const { autoplay, isLiving } = this.config;
    api.on('loadeddata', () => {
      logger.info('Ready:', 'video is ready to played.');
      api.trigger('ready');
      dispatch({
        type: `${readyNamespace}/state`,
      });
      if (autoplay) {
        dispatch({
          type: `${namespace}/play`,
        });
      }
      //兼容edge，用来比较获取loading状态
      this.currentTime = api.currentTime;
      //currentTime处理
      dispatch({
        type: `${namespace}/time`,
        payload: {
          currentTime: api.currentTime,
          duration: api.duration,
        },
      });
      dispatch({
        type: `${namespace}/living`,
        payload: {
          duration: isLiving ? Infinity : api.duration,
        },
      });
    });
  }
  //尝试重载次数记录
  retryReloadTime = 0;
  timeoutAction(type) {
    const api = this.api;
    const dispatch = this.dispatch;
    const locale = localization || api.localization;
    const { timeout = VIDEO_TIMEOUT, retryTimes = RETRY_TIMES } = this.config;
    // console.log(type, 'this.retryReloadTime', this.retryReloadTime);
    if (type === 'timeupdate') {
      clearTimeout(this.videoTimeout);
    }
    //处理超时
    this.videoTimeout = setTimeout(() => {
      // console.log(this.currentTime, api.currentTime, api.playing);

      logger.log('Stalled currentTime:', this.currentTime, api.currentTime);
      if (this.currentTime !== api.currentTime || api.currentTime < 1) {
        //画面不停止了不处理
        //flv.js不播放时，刚开始currentTime会大于0，需要做兼容处理。
        return;
      }
      //需要防止视频结束、暂停、出错等还继续执行这个timeout计时器，所以要clearTimeout
      //超时最多尝试重载retryTimes
      if (this.retryReloadTime < retryTimes) {
        this.retryReloadTime++;
        // console.log(this.retryReloadTime);
        if (api.living || this.config.isLiving) {
          //直播才做重载
          dispatch({
            type: `${namespace}/reload`,
          });
        }
        if (type === 'stalled') {
          this.isStalled = false;
          clearTimeout(this.videoTimeout);
        }
      } else {
        if (api.living || this.config.isLiving) {
          logger.error(
            'Timeout:',
            `try to reload ${retryTimes} times but video can not be loaded.`
          );
        }
        if (!api.isError) {
          api.trigger('error', {
            //基本上trigger都是为了对外提供api，error是个比较特殊的情况，寄对外提供了事件，也对内提供了事件。
            //如果只是对内不对外的话，不可以使用trigger处理事件，所有的都用redux。
            data: {},
            message: locale.timeout,
            type: TIMEOUT_ERROR,
          });
        }
        this.retryReloadTime = 0;
      }
    }, timeout);
  }
  stalled() {
    const api = this.api;
    //stalled事件之后还会执行timeupdate事件，this.videoTimeout会被clear
    //所以需要做判断处理。
    api.on('stalled', e => {
      logger.info(
        'Stalled:',
        'because of network problem,video now is stalled.'
      );
      this.isStalled = true;
      this.currentTime = api.currentTime;
      // console.log(api.isError, api.playing, api.notAutoPlayViewHide);
      if (!api.isError && !api.ended) {
        //hls.js和flv.js在播放正常情况下也会stalled，跟原生的不一样
        //不自动播放时也需要阻止stalled，导致的重新加载。
        //flv视频播放结束后还会触发statlled
        this.timeoutAction('stalled');
      }
    });
  }
  timeupdate() {
    const api = this.api;
    const dispatch = this.dispatch;
    let { livingMaxBuffer = LIVING_MAXBUFFER_TIME, isHls } = this.config;
    api.on('timeupdate', () => {
      // if (api.readyState < 1) {
      //   return;
      // }
      // logger.log('Timeupdate currentTime:', this.currentTime, api.currentTime);
      if (api.living && api.buffered.length > 0 && api.currentTime) {
        if (isHls) {
          //hls需要的直播需要特殊对待。
          livingMaxBuffer += 15;
        }
        //直播实时处理，让视频接近实时。
        if (api.bufferTime - api.currentTime > livingMaxBuffer) {
          let reduceBuffer = livingMaxBuffer;
          if (livingMaxBuffer > 1) {
            if (isHls) {
              reduceBuffer = 15;
            } else {
              reduceBuffer = 1;
            }
          }
          api.currentTime = api.bufferTime - reduceBuffer;
          logger.log(
            'Delay Reduce',
            'Due to the high delay, there is a need to reduce the delay.'
          );
        }
      }
      //只要在播放，retryReloadTime就要设置为0。
      this.retryReloadTime = 0;
      if (api.playing) {
        if (!api.living) {
          //直播不播放状态中不处理loading
          //begin----处理loading状态
          //isIE包括了Edge
          if (this.currentTime === api.currentTime && isIE()) {
            if (!api.loading) {
              //需要做判断，要不会被clearTimeout了
              dispatch({
                type: `${namespace}/loading`,
                payload: true,
              });
            }
          } else if (
            !api.loading &&
            api.readyState === HAVE_CURRENT_DATA &&
            !api.ended
            //api.eneded解决firefox，结束后readyState=2导致的loading未关闭的问题
          ) {
            if (!api.loading) {
              dispatch({
                type: `${namespace}/loading`,
                payload: true,
              });
            }
          } else if (
            api.loading &&
            (api.readyState === HAVE_FUTURE_DATA ||
              api.readyState === HAVE_ENOUGH_DATA)
          ) {
            dispatch({
              type: `${namespace}/loading`,
              payload: false,
            });
          }
          //end----处理loading状态
        } else if (api.loading) {
          //直播状态播放中如果发现loading，直接隐藏。
          dispatch({
            type: `${namespace}/loading`,
            payload: false,
          });
        }
        //currentTime处理
        if (!api.seekingState) {
          dispatch({
            type: `${namespace}/time`,
            payload: {
              currentTime: api.ended ? api.duration : api.currentTime,
              duration: api.duration,
            },
          });
        }
        if (!this.isStalled && this.currentTime !== api.currentTime) {
          //stalled事件之后还会执行timeupdate事件，this.videoTimeout会被clear
          //所以需要做判断处理。
          this.timeoutAction('timeupdate');
        } else {
          this.isStalled = false;
        }
        //最后赋值，可以用来判断视频视频卡顿
        this.currentTime = api.currentTime;
      }
    });
  }
  pause() {
    const api = this.api;
    api.on('pause', e => {
      //清理timeupdate中的定时器。
      clearTimeout(this.videoTimeout);
    });
  }
  error() {
    const api = this.api;
    const dispatch = this.dispatch;
    const locale = localization || api.localization;
    api.on('error', data => {
      clearTimeout(this.videoTimeout);
      //有message和type的是hls.js等事件的错误
      api.isError = true;
      let message = data.message;
      if (!message) {
        logger.error('H5 Video Error:', 'original h5 video error');
      }
      if (!message) {
        message = locale.fileCouldNotPlay;
      }
      if (this.config.videoNotSupport) {
        message = locale.videoNotSupport;
      }
      dispatch({
        type: `${namespace}/errorMessage`,
        payload: {
          message,
        },
      });
    });
  }
  ended() {
    const api = this.api;
    const dispatch = this.dispatch;
    api.on('ended', () => {
      logger.info('Ended:', 'video is ended');
      clearTimeout(this.videoTimeout);
      if (!api.living) {
        //直播是不会结束的
        //即使监控到end事件也不做处理
        dispatch({
          type: `${namespace}/end`,
          payload: true,
        });
      }
    });
  }
  //键盘空格键和video聚焦事件
  onSpaceAndVieoFocusEvent() {
    const api = this.api;
    const dispatch = this.dispatch;
    const keydown = () => {
      this.playerKeydownEvent && this.playerKeydownEvent.off();
      this.playerKeydownEvent = api.on(api.ownerDocument, 'keydown', e => {
        e.preventDefault();
        if (api.living) {
          return;
        }
        if (e.keyCode === 32) {
          logger.info('Keydown:', 'space key is pressed');
          if (api.playing) {
            dispatch({
              type: `${namespace}/pause`,
            });
          } else {
            dispatch({
              type: `${namespace}/play`,
            });
          }
        }
      });
    };
    api.on(api.parentNode, 'mouseenter', e => {
      api.trigger('focus', true);
      if (!api.focus) {
        logger.info('Video Focus:', 'video is focused');
      }
      api.focus = true;
      keydown();
    });
    api.on(api.parentNode, 'mouseleave', e => {
      //为点击播放器，移出去播放器，算失去聚焦。
      if (!this.mousedown) {
        api.focus = false;
        api.trigger('focus', false);
        logger.info('Video Unfocused:', 'video is unfocused');
        this.playerKeydownEvent && this.playerKeydownEvent.off();
      }
    });
    api.on(api.parentNode, 'mousedown', e => {
      this.mousedown = true;
      if (!api.focus) {
        api.trigger('focus', true);
        logger.info('Video Focus:', 'video is focused');
      }
      this.documentMousedownEvent && this.documentMousedownEvent.off();
      this.documentMousedownEvent = api.on(
        api.ownerDocument,
        'mousedown',
        e => {
          if (!contains(api.parentNode, e.target)) {
            this.mousedown = false;
            api.trigger('focus', false);
            logger.info('Video Unfocused:', 'video is unfocused');
            this.documentMousedownEvent.off();
            this.playerKeydownEvent.off();
          }
        }
      );
      keydown();
    });
  }
}

export default function(payload) {
  return new Events(payload);
}
