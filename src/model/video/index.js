//涉及api的功能只会也只能在次model进行处理
//这个model的state不会在页面上用到，这个model是个指挥中心
//触发各种状态然后通知各种model处理页面上的状态
import { namespace as loadingNamespace } from '../loading';
import { namespace as endNamespace } from '../end';
import { namespace as playPauseNamespace } from '../play-pause';
import { namespace as volumeNamespace } from '../volume';
import { namespace as mutedNamespace } from '../muted';
import { namespace as timeNamespace } from '../time';
import { namespace as fullscreenNamespace } from '../fullscreen';
import { namespace as notAutoPlayNamespace } from '../not-autoplay';
import { namespace as controlbarNamespace } from '../controlbar';
import { namespace as timeSliderNamespace } from '../time-slider';
import { namespace as errorMessageNamespace } from '../error-message';
import { namespace as trackNamespace } from '../track';
import { namespace as fragmentNamespace } from '../fragment';
import { namespace as livingNamespace } from '../living';
import { namespace as playbackRateNamespace } from '../playback-rate';
import { namespace as qualityNamespace } from '../picture-quality';
import { namespace as rotateNamespace } from '../rotate';

import {
  MAX_VOLUME,
  CONTROLBAR_TIMEOUT,
  SHOW_LOADING_LAZY_TIME,
  SHOW_ERROR_MESSAGE_LAZY_TIME,
  VIDEO_TIMEOUT,
  // RETRY_TIMES,
} from '../../utils/const';
import fullscreenHelper from '../../utils/dom/fullscreen';
import * as storage from '../../utils/storage';
import * as util from '../../utils/util';
import * as logger from '../../utils/logger';
import videoEvents from './events';
import outSideApi from './outside-api';
import localization from '../../i18n/default';

export const namespace = 'video';

export default function() {
  //model支持方法，也支持纯对象，由于存在多个播放器，有作用域问题
  //需要用到函数，函数返回的是纯对象，_api继承了整个video dom的对象，请参考src/api/api.js的说明。
  let _api;
  let _dispatch;
  let _config;
  //controlbar 隐藏定时器
  let controlbarClearTimeout;
  let fullscreenObj;
  let loadingTimeout;
  let showLoadingLazyTime = SHOW_LOADING_LAZY_TIME;
  let errorMessageTimeout;
  let showErrorMessageLazyTime = SHOW_ERROR_MESSAGE_LAZY_TIME;
  let _videoEvents;
  let clearIntervalForPlay;
  let subtitleList;
  function getTracks() {
    const { tracks } = _config;
    subtitleList = [];
    //字幕，缩略图等
    if (tracks) {
      let i = 0;
      tracks.forEach((v, k) => {
        if (v.kind === 'subtitle') {
          subtitleList.push({
            ...v,
            name: v.label,
            id: i,
          });
          i++;
        } else if (v.kind === 'thumbnail') {
          _dispatch({
            type: `${trackNamespace}/thumbnailSaga`,
            payload: v,
          });
        }
      });
      _dispatch({
        type: `${namespace}/subtitleList`,
        payload: {
          subtitleList: subtitleList,
          subtitleId: -1,
        },
      });
    }
  }
  return {
    namespace,
    state: null,
    reducers: {
      clear: function(state, { payload }) {
        _videoEvents && _videoEvents.reset();
        clearInterval(clearIntervalForPlay);
        if (_api) {
          _api.pause();
          //移除事件监控
          _api.off();
          _api.detachMedia && _api.detachMedia();
          //重置
          _api.reset();
        }
        return this.state || {};
      },
    },
    sagas: {
      *loading({ payload }, { put }) {
        _api.loading = payload;
        if (payload && _api.isError) {
          //错误不展示loading，但是可以隐藏loading。
          return;
        }
        clearTimeout(loadingTimeout);
        if (payload) {
          loadingTimeout = setTimeout(() => {
            //使用setTimeout是为了防止视频很快就可以播放的情况，就不用展示loading。
            //否则就会对用户造成卡顿假像。
            _dispatch({
              type: `${loadingNamespace}/setLoadingStateSaga`,
              payload,
            });
            logger.info('Loading Video:', 'video is not enough to be played');
            _api.trigger('loading', payload);
          }, showLoadingLazyTime);
        } else {
          yield put({
            type: `${loadingNamespace}/setLoadingStateSaga`,
            payload,
          });
          logger.info('Hide Loading:', 'video is enough to be played');
          _api.trigger('loading', payload);
        }
        if (_api.isError) {
          yield {
            type: `${namespace}/errorMessage`,
            payload: {
              message: null,
            },
          };
        }
      },
      *playAfterNotAutoplay({ payload }, { put }) {
        if (!_api.playing) {
          if (!_config.preload) {
            //autoplay=false,preload=false
            _api.loadSource(_config.file);
            getTracks();
          }
          yield put({
            type: `controlbar`,
            payload: true,
          });
          yield put({
            type: `play`,
          });
        }
      },
      *hideNotAutoPlayView({ payload }, { put }) {
        logger.info('Hide Not Auto Play View');
        yield put({
          type: `${notAutoPlayNamespace}/notAutoPlayStateSaga`,
          payload: false,
        });
        _api.notAutoPlayViewHide = true;
      },
      *play({ payload }, { put }) {
        if (_api.isError) {
          return;
        }
        const {
          timeout = VIDEO_TIMEOUT,
          // autoplay,
          // retryTimes = RETRY_TIMES,
        } = _config;
        if (!clearIntervalForPlay && !_api.isError) {
          //hls ts文件500等，然后点击播放后无提示问题。
          const locale = localization || _api.localization;
          clearIntervalForPlay = setInterval(() => {
            _dispatch({
              type: `${namespace}/errorMessage`,
              payload: {
                message: locale.timeout,
              },
            });
            //让timeout时间跟尝试重连的timeout保持最小时间一致。
          }, timeout);
        }
        if (!_api.notAutoPlayViewHide) {
          //当autoplay为false，播放后，需要隐藏not-autoplay页面
          //这里是防止这个页面没被隐藏。
          yield put({
            type: `hideNotAutoPlayView`,
          });
        }
        //要在_api.play之前执行，否则状态就不是播放结束了。
        if (_api.ended) {
          //重新播放
          //重置
          _api.reset();
          //如果已经播放结束，重新播放需要隐藏重新播放按钮
          yield put({
            type: `end`,
            payload: false,
          });
          yield put({
            type: 'time',
            payload: {
              currentTime: 0,
              duration: _api.duration,
            },
          });
          _api.trigger('replay');
        }
        _api.play();
        logger.info('Play Action', 'start playing');
        if (_api.playing) {
          yield put({
            type: `${playPauseNamespace}/playPauseSaga`,
            payload: true,
          });
          if (!_api.bufferTime) {
            yield put({
              type: `loading`,
              payload: true,
            });
          } else if (
            (!_api.loading && _api.bufferTime < _api.currentTime) ||
            //readyState < 3代表视频就绪状态不足以播放。
            _api.readyState < 3
          ) {
            yield put({
              type: `loading`,
              payload: true,
            });
          }
          if (!payload || (payload && !payload.noControlbarAction)) {
            //操作非controlbar的播放按钮，需要设置定时隐藏controlbar的状态
            //如点击整个播放器进行播放
            yield put({
              type: `controlbarClearTimeout`,
            });
            yield put({
              type: `controlbar`,
              payload: false,
              delayTime: CONTROLBAR_TIMEOUT,
            });
          }
        }
      },
      *pause({ payload }, { put }) {
        if (_api.isError) {
          return;
        }
        logger.info('Pause Action', 'start pause');
        _api.pause();
        if (!_api.playing) {
          yield put({
            type: `${playPauseNamespace}/playPauseSaga`,
            payload: false,
          });
          if (_api.loading) {
            yield put({
              type: `loading`,
              payload: false,
            });
          }
          //清理controlbar隐藏定时器
          yield put({
            type: `controlbarClearTimeout`,
          });
          yield put({
            type: `controlbar`,
            payload: true,
          });
        }
      },
      *volume({ payload = 0 }, { put }) {
        let volume = payload;
        if (isNaN(volume)) {
          //错误兼容处理
          volume = 0;
        }
        storage.set('volume', volume);
        //转换成真实的video声音值，原生的video声音范围为[0,1]。
        const realVideoVolume = volume / MAX_VOLUME * 1;
        _api.setVolume(realVideoVolume);
        yield put({
          type: `${volumeNamespace}/dataSaga`,
          payload,
        });
        _api.trigger('volume', volume);
        logger.info(
          'Set Volume',
          `set volume to ${volume.toFixed(2)},the max volume is 100.`
        );
      },
      *muted({ payload = false, autoMuted = false }, { put }) {
        let muted = payload;
        if (!autoMuted) {
          storage.set('muted', muted);
        }
        _api.muted = muted;
        yield put({
          type: `${mutedNamespace}/dataSaga`,
          payload,
        });
        if (muted) {
          //展示的声音值设置为0
          yield put({
            type: `${volumeNamespace}/dataSaga`,
            payload: 0,
          });
        }
        _api.trigger('muted', muted);
        if (muted) {
          logger.info('Set Muted', `set video muted `);
        } else {
          logger.info('Cancel Muted', `cancel video muted `);
        }
      },
      *end({ payload }, { put }) {
        yield put({
          type: `pause`,
        });
        if (_api.loading) {
          yield put({
            type: `loading`,
            payload: false,
          });
        }
        yield put({
          type: `${endNamespace}/endStateSaga`,
          payload,
        });
        yield put({
          type: `controlbar`,
          payload: true,
          onControlbarEnter: false,
        });
        yield put({
          type: `time`,
          payload: {
            currentTime: _api.ended ? _api.duration : _api.currentTime,
            duration: _api.duration,
          },
        });
      },
      *replay({ payload }, { put }) {
        yield put({
          type: `time`,
          payload: {
            currentTime: 0,
            duration: 0,
          },
        });
        yield put({
          type: `end`,
          payload: false,
        });
        yield put({
          type: `play`,
        });
        logger.info('Replay', `replay video when video is ended.`);
      },
      *time({ payload }, { put, select }) {
        clearInterval(clearIntervalForPlay);
        if (_api.isError) {
          yield put({
            type: `errorMessage`,
            payload: {
              message: null,
            },
          });
        }
        yield put({
          type: `${timeNamespace}/timeSaga`,
          payload,
        });
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        if (!fragment || !fragment.data) {
          yield put({
            type: `${timeSliderNamespace}/timeSaga`,
            payload: {
              buffer: _api.bufferTime,
              ...payload,
            },
          });
        } else {
          yield put({
            type: 'fragment',
          });
        }
      },
      //合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
      //但是这个视频不是整个时段的，会有断的，为了给用户知道这段录像哪里断了，需要而外处理
      //这里是为了算出播放中，遇到断片的情况，进行一些跳过处理
      *fragment({ payload = {} }, { put, select }) {
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        if (!fragment || !fragment.data) {
          return;
        }
        const { duration: fragmentDuration, data: fragmentData } = fragment;
        let sliderPercent = 0;
        const { seeking, percent } = payload;
        if (seeking) {
          let position = percent * fragmentDuration;
          //如果是点击、拖拽
          _api.videoGaps = 0;
          fragmentData.forEach(v => {
            if (position >= v.begin) {
              _api.videoGaps = v.gaps;
            }
            if (position >= v.begin && position < v.end) {
              position = v.begin + v.gap;
            }
          });
          _api.currentTime = position - _api.videoGaps;
          sliderPercent = percent;
        } else {
          const gapPosition = _api.currentTime + _api.videoGaps;
          fragmentData.forEach((v, k) => {
            if (gapPosition >= v.begin && gapPosition < v.end) {
              for (var i = 0; i <= k; i++) {
                _api.videoGaps = fragmentData[i].gaps;
              }
            }
          });
          sliderPercent =
            (_api.currentTime + _api.videoGaps) / fragmentDuration;
        }
        if (sliderPercent > 1 || _api.ended) {
          sliderPercent = 1;
        }
        yield put({
          type: `${fragmentNamespace}/sliderReducer`,
          payload: {
            percent: sliderPercent,
          },
        });
      },
      //是否在seeking
      *seekingState({ payload }, { put }) {
        if (_api.ended) {
          return;
        }
        if (payload) {
          logger.info('Start seeking');
        } else {
          logger.info('Stop seeking');
        }
        _api.seekingState = payload;
        if (payload && _api.playing) {
          _api.pause();
        }
        if (!payload) {
          //seeking结束后，都播放视频。
          if (!_api.playing) {
            yield put({ type: `play` });
          } else {
            _api.play();
          }
        }
      },
      *seeking(
        {
          payload: { percent = 0, pause },
        },
        { put, select }
      ) {
        if (_api.readyState < 1) {
          //视频未就绪进来，不给操作，要不会报错
          return;
        }
        if (_api.ended) {
          yield put({
            type: `end`,
            payload: false,
          });
        }
        if (!pause) {
          if (_api.bufferTime < _api.currentTime) {
            yield put({
              type: `loading`,
              payload: true,
            });
          }
        }
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        if (!fragment || !fragment.data) {
          _api.currentTime = _api.duration * percent;
        } else {
          yield put({
            type: 'fragment',
            payload: {
              seeking: true,
              percent,
            },
          });
        }
        yield put({
          type: `${timeSliderNamespace}/timeSaga`,
          payload: {
            buffer: _api.bufferTime,
            currentTime: _api.currentTime,
            duration: _api.duration,
          },
        });
        _api.trigger('seek', percent);
      },
      *fullscreen({ payload }, { put }) {
        if (fullscreenObj) {
          fullscreenObj.remove();
        }
        fullscreenObj = new fullscreenHelper(
          _api.parentElement || _api.parentNode,
          _api.ownerDocument,
          function() {
            const isFull = fullscreenObj.fullscreenElement();
            _api.trigger('fullscreen', !!isFull);
            if (isFull) {
              logger.info('Fullscreen');
            } else {
              logger.info('Fullscreen exited');
            }
            _dispatch({
              type: `${fullscreenNamespace}/fullscreenSaga`,
              payload: !!isFull,
            });
            if (!isFull) {
              //非全屏，移除监听器。
              fullscreenObj.remove();
              fullscreenObj = null;
            }
          }
        );
        if (fullscreenObj.supportsDomFullscreen) {
          if (payload) {
            fullscreenObj.requestFullscreen();
          } else {
            fullscreenObj.exitFullscreen();
          }
        } else {
          //异常处理
        }
        if (_api.playing) {
          //会存在全屏时，没触发，controlbar移出事件
          yield put({
            type: `controlbar`,
            payload: false,
            delayTime: CONTROLBAR_TIMEOUT,
            onControlbarEnter: false,
          });
        }
      },
      controlbarClearTimeout({ payload }) {
        if (payload && payload.onControlbarEnter !== undefined) {
          _api.onControlbarEnter = payload.onControlbarEnter;
        }
        controlbarClearTimeout && controlbarClearTimeout();
      },
      *controlbar({ payload, delayTime, onControlbarEnter }, { put }) {
        //先清除，可能遗留的
        yield put({
          type: `controlbarClearTimeout`,
        });
        if (_api.isError && !payload) {
          //错误不给隐藏
          return;
        }
        if (onControlbarEnter !== undefined) {
          _api.onControlbarEnter = onControlbarEnter;
        }
        if (_api.onControlbarEnter) {
          //如果正在controlbar上，强制controlbar显示
          payload = true;
        }
        let flag = true;
        //controlbar隐藏时，delay才有效，显示controlbar是立刻显示
        if (delayTime && !payload) {
          const delayPromise = util.delay(delayTime);
          controlbarClearTimeout = delayPromise.clearTimeout;
          flag = yield delayPromise;
        }
        if (flag) {
          if (payload) {
            _api.controlbarShow = true;
            logger.info('Controlbar show');
          } else {
            _api.controlbarShow = false;
            logger.info('Controlbar hide');
          }
          yield put({
            type: `${controlbarNamespace}/controlbarSaga`,
            payload,
          });
          //对外提供controlbar事件
          _api.trigger('controlbar', payload);
        }
      },
      errorMessage({ payload }, { put }) {
        clearInterval(clearIntervalForPlay);
        clearTimeout(errorMessageTimeout);
        if (_api.ended) {
          return;
        }
        const error = () => {
          if (!_api.controlbarShow) {
            _dispatch({
              type: `${namespace}/controlbar`,
              payload: true,
              onControlbarEnter: false,
            });
          }
          if (!_api.notAutoPlayViewHide) {
            //如果not-autoplay页面没关闭
            _dispatch({
              type: `${namespace}/hideNotAutoPlayView`,
            });
          }
          _dispatch({
            type: `${errorMessageNamespace}/errorMessageSaga`,
            payload,
          });
          // 把播放暂停显示按钮显示为暂停。
          _dispatch({
            type: `${playPauseNamespace}/playPauseSaga`,
            payload: false,
          });
        };
        if (payload.message) {
          errorMessageTimeout = setTimeout(() => {
            _api.isError = true;
            //使用setTimeout是为了防止视频很快就可以播放的情况，就不用展示loading。
            //否则就会对用户造成卡顿假像。
            logger.info('Error message show');
            if (_api.loading) {
              //如果还有loading，需要隐藏
              _dispatch({
                type: `${namespace}/loading`,
                payload: false,
              });
            }
            error();
          }, showErrorMessageLazyTime);
        } else {
          logger.info('Error message hide');
          error();
          //如果非错误，需要设置_api.isError为false
          _api.isError = false;
        }
      },
      *reload({ payload }, { put }) {
        logger.info('Reload Video');
        _api.reloading = true;
        _api.trigger('reload');
        //重置
        _api.reset();
        _videoEvents && _videoEvents.reset();
        //报错保存之前的播放进度
        const tempCurrentTime = _api.currentTime;
        _api.loadSource && _api.loadSource(util.joinUrlParams(_api.file, {}));
        //isLiving强制设置为直播状态。safari中flv无法获取直播状态，所以需要设置这个。
        if (!_api.living || _config.isLiving) {
          _api.currentTime = tempCurrentTime;
        }
        _api.isError = false;
        //重载后还原
        clearIntervalForPlay = undefined;
        yield put({
          type: `loading`,
          payload: true,
        });
        yield put({
          type: `errorMessage`,
          payload: {
            message: null,
          },
        });
        yield put({
          type: `play`,
        });
      },
      *living(
        {
          payload: { duration },
        },
        { put }
      ) {
        let living = false;
        if (duration === Infinity || isNaN(duration)) {
          living = true;
        }
        if (living) {
          logger.info('Living', 'the video is a living video.');
        }
        _api.living = living;
        yield put({
          type: `${livingNamespace}/setLivingSaga`,
          payload: living,
        });
      },
      *playbackRate({ payload: playbackRate }, { put }) {
        logger.info('PlaybackRate switched');
        _api.playbackRate = playbackRate;
        yield put({
          type: `${playbackRateNamespace}/setPlaybackRateSaga`,
          payload: playbackRate,
        });
      },
      *subtitleList({ payload }, { put }) {
        logger.info('Subtitle List showed');
        yield put({
          type: `${trackNamespace}/subtitleListSaga`,
          payload,
        });
      },
      *switchSubtitle({ payload }, { put }) {
        //存储状态
        _api.currentSubtitleTrack = payload;
        //end----textTracks状态处理
        if (_api.hlsObj) {
          //hls.js解析的hls自带字幕
          //hls.js切换方式就是这样。
          _api.hlsObj.subtitleTrack = payload;
        } else if (_api.textTracks.length > 0) {
          //浏览器原生解析的hls自带字幕
          //begin----textTracks状态处理
          for (let i = 0; i < _api.textTracks.length; i++) {
            _api.textTracks[i].mode = 'disabled';
          }
          if (_api.textTracks[payload]) {
            //关闭不用处理
            _api.textTracks[payload].mode = 'hidden';
          }
        } else {
          if (subtitleList && subtitleList[payload]) {
            //非hls自带的字幕，播放器自定义字幕
            yield put({
              type: `${trackNamespace}/subtitleCuesSaga`,
              payload: {
                subtitleId: payload,
                file: subtitleList[payload].file,
              },
            });
          } else {
            //关闭字幕
            yield put({
              type: `${trackNamespace}/subtitleCuesSaga`,
              payload: {
                subtitleId: payload,
              },
            });
          }
        }
        yield put({
          type: `${trackNamespace}/subtitleListSaga`,
          payload: {
            subtitleId: payload,
          },
        });
      },
      *hlsSubtitleCues({ payload }, { put }) {
        const cues = [];
        for (let k = 0; k < payload.length; k++) {
          let v = payload[k];
          cues.push({
            begin: v.startTime,
            end: v.endTime,
            text: v.text,
          });
        }
        yield put({
          type: `${trackNamespace}/hlsSubtitleCuesSaga`,
          payload: cues,
        });
      },
      *pictureQualityList({ payload }, { put }) {
        yield put({
          type: `${qualityNamespace}/dataSaga`,
          payload,
        });
      },
      *switchPictureQuality({ payload }, { put }) {
        if (_api.hlsObj) {
          //hls.js切换画质
          _api.hlsObj.nextLevel = payload;
        }
        yield put({
          type: `${qualityNamespace}/dataSaga`,
          payload: {
            currentQuality: payload,
          },
        });
      },
      *rotate({ payload }, { put }) {
        yield put({
          type: `${rotateNamespace}/dataSaga`,
          payload,
        });
        const width = _api.clientWidth;
        const height = _api.clientHeight;
        _api.style.transform = `rotate(-${payload}deg)`;
        if (payload === 90 || payload === 270) {
          _api.style.width = `${height}px`;
          _api.style.marginLeft = `${width / 2 - height / 2}px`;
        } else {
          _api.style.width = '';
          _api.style.marginLeft = '';
        }
      },
      //注意，回调函数中用不了put，改用dispatch，如果使用dispatch就需要绑上namespace
      *init({ payload, initOverCallback }, { put }) {
        let { dispatch, api, hlsjsEvents, config } = payload;
        const {
          autoplay,
          showLoadingLazyTime: loadingLazyTime,
          showErrorMessageLazyTime: errorMessageLazyTime,
          file,
          preload = true,
          muted,
        } = config;

        if (loadingLazyTime) {
          showLoadingLazyTime = loadingLazyTime;
        }
        if (errorMessageLazyTime) {
          showErrorMessageLazyTime = errorMessageLazyTime;
        }
        _api = api;
        _dispatch = dispatch;
        _config = config;
        //初始化loading状态
        if (autoplay) {
          _api.loadSource(file);
          getTracks();
          logger.info('Autoplay:', 'set the video to play automatically');
          _api.autoplay = autoplay;
          _api.notAutoPlayViewHide = true;
          yield put({
            type: `loading`,
            payload: true,
          });
          yield put({
            type: `play`,
          });
          yield put({
            type: `controlbar`,
            payload: true,
          });
          //当autoplay=true初始化controlbar默认为显示
          _api.trigger('controlbar', true);
        } else {
          if (preload) {
            _api.loadSource(file);
            getTracks();
          }
          _api.trigger('loading', false);
          _api.loading = false;
        }
        if (muted) {
          yield put({
            type: `muted`,
            payload: true,
            autoMuted: true,
          });
        }
        //防止事件没移除
        _api.off();
        //----begin 事件处理
        _videoEvents = videoEvents(payload);
        if (hlsjsEvents) {
          hlsjsEvents(payload);
        }
        //----end 事件处理
        //等待video运行起来后运行，对外提供接口
        const _outSideApi = outSideApi(payload, this.sagas);
        initOverCallback && initOverCallback(_outSideApi);
      },
    },
  };
}
