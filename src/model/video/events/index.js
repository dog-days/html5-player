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
import { isSafari } from '../../../utils/browser';

import { TIMEOUT_ERROR } from '../../../utils/error-code';
import { isIE } from '../../../utils/browser';
import contains from '../../../utils/dom/contains';

class Events {
  /**
   *
   * @param {object} payload model vidoe/init的payload
   * @param {boolean} isFirstPlay 是否是第一次播放视频
   * @param {object} _state 存放一些状态，reload都不会改变的
   */
  constructor(payload, isFirstPlay, _state) {
    this.api = payload.api;
    this._state = _state;
    this.dispatch = payload.dispatch;
    //是否是第一次播放视频
    this.isFirstPlay = isFirstPlay;
    this.config = payload.config;
    if (!this.api.hlsObj) {
      this.setOriginHlsSubtitle();
    }
    this.loadeddata();
    this.timeupdate();
    this.pause();
    this.error();
    this.ended();
    this.onSpaceAndVieoFocusEvent();
    this.setTimeoutInterval(true);
    logger.info('Listening:', 'listening on h5 video events.');
  }
  /**
   * 定时检查超时问题，视频播放中卡住超过设定时间，属于超时
   * @param {boolean} withoutPlayingState 无playing状态
   */
  setTimeoutInterval(withoutPlayingState) {
    clearInterval(this.timeoutInterval);
    const { timeout = VIDEO_TIMEOUT } = this.config;
    this.timeoutInterval = setInterval(() => {
      //定时查看是否超时
      //404等非200或者不是正确的视频，刚开始会报错，并不会播放，所以刚开始不能被playing拦截
      // console.log(this.api.playing, withoutPlayingState);
      if (this.api.playing || withoutPlayingState) {
        this.timeoutAction();
      }
    }, timeout);
  }
  reset() {
    this.currentTime = 0;
    clearInterval(this.timeoutInterval);
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
    const config = this.config;
    const dispatch = this.dispatch;
    const { isLiving, defaultCurrentTime } = this.config;
    api.on('loadeddata', () => {
      this.isLoadeddata = true;
      //视频载入后重新定时处理超时。
      this.setTimeoutInterval();
      //设置重载状态false，这个视事件运行了，视频就可以播放了。
      logger.info('Ready:', 'video is ready to played.');
      api.trigger('ready');
      //isLiving强制设置为直播状态。safari中flv无法获取直播状态，所以需要设置这个。
      if (!api.living && !config.isLiving && this._state.lastCurrentTime) {
        //播放中途出错，重载需要载入上一个播放进度
        api.currentTime = this._state.lastCurrentTime;
        this._state.lastCurrentTime = 0;
      } else if (defaultCurrentTime !== undefined) {
        // console.log(window.historyVideoCurrentTime);
        api.currentTime = window.historyVideoCurrentTime || defaultCurrentTime;
        //重置
        window.historyVideoCurrentTime = 0;
      }
      if (!this.isFirstPlay) {
        dispatch({
          type: `${videoNamespace}/play`,
        });
      } else if (api.autoplay) {
        dispatch({
          type: `${videoNamespace}/play`,
        });
      }
      dispatch({
        type: `${readyNamespace}/state`,
      });
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
      dispatch({
        type: `${videoNamespace}/loading`,
        payload: {
          loading: false,
        },
      });
      api.reloading = false;
      this._state.retryReloadTime = 0;
    });
  }
  timeoutAction() {
    const api = this.api;
    const locale = api.localization;
    // const { retryTimes = RETRY_TIMES } = this.config;
    // console.log(this.currentTime, api.currentTime, this.api.isError);
    if (this.api.isError || this.api.ended) {
      return;
    }
    if (
      this.currentTime !== api.currentTime &&
      this.currentTime !== undefined
    ) {
      //视频在播放（视频状态为播放中，但是没有因为网络而卡顿），不处理
      this.currentTime = api.currentTime;
      return;
    }
    api.trigger('error', {
      //基本上trigger都是为了对外提供api，error是个比较特殊的情况，寄对外提供了事件，也对内提供了事件。
      //如果只是对内不对外的话，不可以使用trigger处理事件，所有的都用redux。
      data: {},
      message: locale.timeout,
      type: TIMEOUT_ERROR,
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
                payload: {
                  loading: true,
                },
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
                payload: {
                  loading: true,
                },
              });
            }
          } else if (
            api.loading &&
            (api.readyState === HAVE_FUTURE_DATA ||
              api.readyState === HAVE_ENOUGH_DATA)
          ) {
            dispatch({
              type: `${videoNamespace}/loading`,
              payload: {
                loading: false,
              },
            });
          }
          //end----处理loading状态
        } else if (api.loading && this.currentTime !== api.currentTime) {
          //直播状态正在播放中如果发现loading，直接隐藏。
          dispatch({
            type: `${videoNamespace}/loading`,
            payload: {
              loading: false,
            },
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
        //直播延时变大处理
        //safari原生的hls，在直播延时处理失效，还没有解决办法，不过hls本来的延时就大，影响不大。
        //使用的hls.js和flv.js延时处理是正常的。
        //edge原生的hls的也正常，不过经常会卡，然后就触发了重载，然后就正常了。
        //正常网络下hls处理延时变大会很少的，flv才可能频繁一点，flv的实时性要求高。
        if (
          api.living &&
          api.buffered.length > 0 &&
          api.currentTime &&
          livingMaxBuffer > 0 &&
          !api.isError
        ) {
          //livingMaxBuffer=0，相当于没设置，最好不要设置为0
          if (isHls) {
            //hls需要的直播需要特殊对待。
            livingMaxBuffer += 15;
          }
          //直播实时处理，让视频接近实时。
          // console.log(api.bufferTime, api.buffered.end(0));
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
            logger.log(
              'Delay Reduce',
              'Due to the high delay, there is a need to reduce the delay.'
            );
          }
        }
        if (api.currentTime) {
          //只要在播放，retryReloadTime就要设置为0。
          this._state.retryReloadTime = 0;
        }
        this.setTimeoutInterval();
        this._state.retryReloadTime = 0;
      }
      //最后赋值，可以用来判断视频视频卡顿
      this.currentTime = api.currentTime;
      if (api.isError) {
        //隐藏错误信息
        dispatch({
          type: `${videoNamespace}/errorMessage`,
          payload: {
            message: null,
          },
        });
      }
    });
  }
  pause() {
    const api = this.api;
    api.on('pause', e => {
      //清理timeupdate中的定时器。
    });
  }
  error() {
    const api = this.api;
    const dispatch = this.dispatch;
    const locale = api.localization;
    const { retryTimes = RETRY_TIMES } = this.config;
    api.on('error', data => {
      if (data && data.nativeEvent) {
        //h5 原生报错截止不处理，只做超时处理。
        return;
      }
      const retryReloadTime = this._state.retryReloadTime;
      if (retryReloadTime < retryTimes) {
        this._state.retryReloadTime++;
        logger.warn('Timeout:', `try to reload ${retryReloadTime + 1} times.`);
        dispatch({
          type: `${videoNamespace}/reload`,
          payload: {
            retryReloadTime: retryReloadTime + 1,
          },
        });
      } else {
        logger.error(
          'Timeout:',
          `try to reload ${retryTimes} times but video can not be loaded.`
        );
        this._state.retryReloadTime = 1;
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
          type: `${videoNamespace}/loading`,
          payload: {
            message: null,
            retryReloadTime: 1,
          },
        });
        dispatch({
          type: `${videoNamespace}/errorMessage`,
          payload: {
            message,
          },
        });
      }
    });
  }
  ended() {
    const api = this.api;
    const dispatch = this.dispatch;
    api.on('ended', () => {
      logger.info('Ended:', 'video is ended');
      if (!api.living && !this.config.isLiving) {
        //直播是不会结束的
        //即使监控到end事件也不做处理
        dispatch({
          type: `${videoNamespace}/end`,
          payload: true,
        });
      } else if (!isSafari()) {
        //直播有时候会遇到结束事件，那是因为转发切换触发结束事件
        //safari flv.js直播经常报ended事件。
        //等待两秒重新拉流，因为转发切换可能会有延时，播放链接不是立即就可以播放。
        //真正直播结束的场景，目前不做考虑。
        setTimeout(() => {
          dispatch({
            type: `${videoNamespace}/reload`,
          });
        }, 2000);
      }
    });
  }
  //键盘空格键和video聚焦事件
  onSpaceAndVieoFocusEvent() {
    if (!this.config.spaceAction) {
      return false;
    }
    const api = this.api;
    const dispatch = this.dispatch;
    const keydown = () => {
      this.playerKeydownEvent && this.playerKeydownEvent.off();
      this.playerKeydownEvent = api.on(api.ownerDocument, 'keydown', e => {
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

export default function(...params) {
  return new Events(...params);
}
