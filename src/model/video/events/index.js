import { namespace as readyNamespace } from '../../ready';
import { namespace as videoNamespace } from '../../video';
import {
  HAVE_CURRENT_DATA,
  HAVE_FUTURE_DATA,
  HAVE_ENOUGH_DATA,
  VIDEO_TIMEOUT,
  LIVING_MAXBUFFER_TIME,
  RETRY_TIMES,
} from '../../../utils/const';
import * as logger from '../../../utils/logger';

import { TIMEOUT_ERROR } from '../../../utils/error-code';
import { isIE } from '../../../utils/browser';
import contains from '../../../utils/dom/contains';
import localization from '../../../i18n/default';

class Events {
  constructor(payload) {
    this.api = payload.api;
    this.dispatch = payload.dispatch;
    this.config = payload.config;
    if (!this.api.hlsObj) {
      this.setOriginHlsSubtitle();
    }
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
    this.currentTime = 0;
    clearTimeout(this.videoTimeout);
  }
  //原生浏览器hls
  setOriginHlsSubtitle() {
    const api = this.api;
    if (this.config.isHls) {
      const textTracks = api.textTracks;
      let clearIntervalObj;
      clearInterval(clearIntervalObj);
      let tempLength = 0;
      //trackList长度一样后执行次数
      let count = 0;
      clearIntervalObj = setInterval(() => {
        //由于firefox不支持change事件
        if (textTracks.length === 0) {
          return;
        }
        let subtitleLength = 0;
        let subtitleList = [];
        let subtitleId = 0;
        for (let i = 0; i < textTracks.length; i++) {
          if (textTracks[i].kind === 'subtitles') {
            subtitleList.push({
              id: subtitleId,
              name: textTracks[i].label,
              ...textTracks[i],
            });
            subtitleId++;
            textTracks[i].mode = 'disabled';
            subtitleLength++;
          }
        }
        if (tempLength === subtitleLength) {
          if (count >= 2) {
            //如果两次以上length都没变化就判断为textTrack没变化。
            //这里不排除网络很差的导致加载出问题，但是这种极端情况，不好处理，也没必要处理。
            //因为如果网络都差到连2KB左右的内容都加载不了，也完全播放不了视频了。
            api.off('cuechange'); //防止连续监听事件。
            for (let i = 0; i < textTracks.length; i++) {
              api.on(textTracks[i], 'cuechange', cues => {
                this.dispatch({
                  type: `${videoNamespace}/hlsSubtitleCues`,
                  payload: cues.target.activeCues,
                });
              });
            }
            this.dispatch({
              type: `${videoNamespace}/subtitleList`,
              payload: {
                subtitleList: subtitleList,
                subtitleId: -1,
              },
            });
            clearInterval(clearIntervalObj);
          }
          count++;
        }
        tempLength = subtitleLength;
      }, 200);
    }
  }

  loadeddata() {
    const api = this.api;
    const dispatch = this.dispatch;
    const { autoplay, isLiving } = this.config;
    api.on('loadeddata', () => {
      //防止超时还在执行
      clearTimeout(this.videoTimeout);
      //设置重载状态false，这个视事件运行了，视频就可以播放了。
      api.reloading = false;
      logger.info('Ready:', 'video is ready to played.');
      api.trigger('ready');
      dispatch({
        type: `${readyNamespace}/state`,
      });
      if (autoplay) {
        dispatch({
          type: `${videoNamespace}/play`,
        });
      }
      //兼容edge，用来比较获取loading状态
      this.currentTime = api.currentTime;
      //currentTime处理
      dispatch({
        type: `${videoNamespace}/time`,
        payload: {
          currentTime: api.currentTime,
          duration: api.duration,
        },
      });
      dispatch({
        type: `${videoNamespace}/living`,
        payload: {
          duration: isLiving ? Infinity : api.duration,
        },
      });
    });
  }
  //尝试重载次数记录
  retryReloadTime = 0;
  timeoutAction() {
    const api = this.api;
    const dispatch = this.dispatch;
    const locale = localization || api.localization;
    const { timeout = VIDEO_TIMEOUT, retryTimes = RETRY_TIMES } = this.config;
    // console.log(type, 'this.retryReloadTime', this.retryReloadTime);
    //处理超时
    this.videoTimeout = setTimeout(() => {
      // console.log(this.currentTime, api.currentTime, api.playing);

      logger.log('Stalled currentTime:', this.currentTime, api.currentTime);
      if (this.currentTime !== api.currentTime) {
        //视频在播放（视频状态为播放中，但是没有因为网络而卡顿），不处理
        return;
      }
      //需要防止视频结束、暂停、出错等还继续执行这个timeout计时器，所以要clearTimeout
      //超时最多尝试重载retryTimes
      const isLiving = api.living || this.config.isLiving;
      if (this.retryReloadTime < retryTimes && isLiving) {
        this.retryReloadTime++;
        // console.log(this.retryReloadTime);
        if (isLiving) {
          //直播才做重载
          dispatch({
            type: `${videoNamespace}/reload`,
          });
        }
        logger.info('Timeout:', `try to reload.`);
      } else {
        if (isLiving) {
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
      this.isStalled = false;
    }, timeout);
  }
  stalled() {
    const api = this.api;
    //stalled事件之后还会执行timeupdate事件，this.videoTimeout会被clear
    //所以需要做判断处理。
    api.on('stalled', e => {
      this.currentTime = api.currentTime;
      if (
        !this.isStalled &&
        !api.isError &&
        !api.ended &&
        !api.reloading &&
        !this.reducingDelay
      ) {
        logger.info(
          'Stalled:',
          'because of network problem,video now is stalled.'
        );
        this.isStalled = true;
        //hls.js和flv.js在播放正常情况下也会stalled，跟原生的不一样
        //不自动播放时也需要阻止stalled，导致的重新加载。
        //flv视频播放结束后还会触发statlled
        this.timeoutAction();
      }
    });
  }
  timeupdate() {
    const api = this.api;
    const dispatch = this.dispatch;
    let { livingMaxBuffer = LIVING_MAXBUFFER_TIME, isHls } = this.config;
    api.on('timeupdate', () => {
      if (api.playing) {
        if (!api.living) {
          //直播不播放状态中不处理loading
          //begin----处理loading状态
          //isIE包括了Edge
          if (this.currentTime === api.currentTime && isIE()) {
            if (!api.loading) {
              //需要做判断，要不会被clearTimeout了
              dispatch({
                type: `${videoNamespace}/loading`,
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
                type: `${videoNamespace}/loading`,
                payload: true,
              });
            }
          } else if (
            api.loading &&
            (api.readyState === HAVE_FUTURE_DATA ||
              api.readyState === HAVE_ENOUGH_DATA)
          ) {
            dispatch({
              type: `${videoNamespace}/loading`,
              payload: false,
            });
          }
          //end----处理loading状态
        } else if (api.loading && this.currentTime !== api.currentTime) {
          //直播状态正在播放中如果发现loading，直接隐藏。
          dispatch({
            type: `${videoNamespace}/loading`,
            payload: false,
          });
        }
        //currentTime处理
        if (!api.seekingState) {
          dispatch({
            type: `${videoNamespace}/time`,
            payload: {
              currentTime: api.ended ? api.duration : api.currentTime,
              duration: api.duration,
            },
          });
        }
        if (this.currentTime !== api.currentTime) {
          clearTimeout(this.videoTimeout);
        }
        if (this.isStalled && this.currentTime !== api.currentTime) {
          this.isStalled = false;
          //播放中取消，减少延时的状态
          this.reducingDelay = false;
        } else if (!api.reloading && !this.reducingDelay) {
          this.timeoutAction();
        }
        //直播延时变大处理
        //safari原生的hls，在直播延时处理失效，还没有解决办法，不过hls本来的延时就大，影响不大。
        //使用的hls.js和flv.js延时处理是正常的。
        //edge原生的hls的也正常，不过经常会卡，然后就触发了重载，然后就正常了。
        //正常网络下hls处理延时变大会很少的，flv才可能频繁一点，flv的实时性要求高。
        if (
          api.living &&
          api.buffered.length > 0 &&
          api.currentTime &&
          livingMaxBuffer > 0
        ) {
          //livingMaxBuffer=0，相当于没设置，最好不要设置为0
          if (isHls) {
            //hls需要的直播需要特殊对待。
            livingMaxBuffer += 15;
          }
          //直播实时处理，让视频接近实时。
          if (api.bufferTime - api.currentTime > livingMaxBuffer) {
            let reduceBuffer;
            if (isHls) {
              reduceBuffer = 15;
            } else {
              reduceBuffer = 1;
            }
            //浏览器原生的hls，在直播状态设置currentTime失效。
            api.currentTime = api.bufferTime - reduceBuffer;
            //标记正在减少延时状态
            this.reducingDelay = true;
            //同时超时重新计算
            clearTimeout(this.videoTimeout);
            logger.log(
              'Delay Reduce',
              'Due to the high delay, there is a need to reduce the delay.'
            );
          }
        }
        //只要在播放，retryReloadTime就要设置为0。
        this.retryReloadTime = 0;
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
      this.reset();
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
        type: `${videoNamespace}/errorMessage`,
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
      if (!api.living && !this.config.isLiving) {
        //直播是不会结束的
        //即使监控到end事件也不做处理
        dispatch({
          type: `${videoNamespace}/end`,
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
              type: `${videoNamespace}/pause`,
            });
          } else {
            dispatch({
              type: `${videoNamespace}/play`,
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
