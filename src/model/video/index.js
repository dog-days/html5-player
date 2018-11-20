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
import { namespace as selectionNamespace } from '../selection';
import { namespace as livingNamespace } from '../living';
import { namespace as playbackRateNamespace } from '../playback-rate';
import { namespace as qualityNamespace } from '../picture-quality';
import { namespace as rotateNamespace } from '../rotate';

import {
  MAX_VOLUME,
  SHOW_LOADING_LAZY_TIME,
  SHOW_ERROR_MESSAGE_LAZY_TIME,
  // VIDEO_TIMEOUT,
  // RETRY_TIMES,
} from '../../utils/const';
import fullscreenHelper from '../../utils/dom/fullscreen';
import * as storage from '../../utils/storage';
import * as util from '../../utils/util';
import * as logger from '../../utils/logger';
import videoEvents from './events';
import outSideApi from './outside-api';

export const namespace = 'video';

export default function() {
  //model支持方法，也支持纯对象，由于存在多个播放器，有作用域问题
  //需要用到函数，函数返回的是纯对象，_api继承了整个video dom的对象，请参考src/api/api.js的说明。
  let _initPayload;
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
  let subtitleList;
  //后续存放公共的一些state
  let _state = {
    retryReloadTime: 0,
    lastCurrentTime: 0,
  };
  let tempSeekingCurrentTime;
  //视频第一次播放,autoplay=false是，需要手动播放才算第一次播放
  //只要触发了play就算首次播放，不需要视频成功播放（重连是属于播放器播放异常，每个实例化的播放器只有一次首次播放，重连不会重新计算）
  let isFirstPlay = true;
  //是否是重连状态
  //init函数运行完重置，不是根据dataloaded处理
  let isReloading = false;
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
    state: {
      historyPercent: 0,
    },
    reducers: {
      clear: function(state, { payload }) {
        _videoEvents && _videoEvents.reset();
        if (_api) {
          _api.pause();
          //移除事件监控
          _api.off();
          _api.detachMedia && _api.detachMedia();
          //重置
          _api.reset();
          _api = undefined;
        }
        //clear 正在setTimeout的定时器
        controlbarClearTimeout && controlbarClearTimeout();
        tempSeekingCurrentTime = undefined;
        return this.state || {};
      },
    },
    sagas: {
      *loading({ payload }, { put }) {
        const loading = payload.loading;
        _api.loading = loading;
        if (loading && _api.isError) {
          //错误不展示loading，但是可以隐藏loading。
          return;
        }
        clearTimeout(loadingTimeout);
        if (loading) {
          loadingTimeout = setTimeout(() => {
            //使用setTimeout是为了防止视频很快就可以播放的情况，就不用展示loading。
            //否则就会对用户造成卡顿假像。
            _dispatch({
              type: `${loadingNamespace}/setLoadingStateSaga`,
              payload,
            });
            logger.info('Loading Video:', 'video is not enough to be played');
            _api.trigger('loading', loading);
          }, showLoadingLazyTime);
        } else {
          yield put({
            type: `${loadingNamespace}/setLoadingStateSaga`,
            payload,
          });
          logger.info('Hide Loading:', 'video is enough to be played');
          _api.trigger('loading', loading);
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
          //autoplay=flase时需要再手动播放后运行
          _videoEvents = videoEvents(_initPayload, isFirstPlay, _state);
          isFirstPlay = false;
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
        yield put({
          type: `${playPauseNamespace}/playPauseSaga`,
          payload: true,
        });
        if (!_api.bufferTime) {
          yield put({
            type: `loading`,
            payload: {
              loading: true,
            },
          });
        } else if (
          (!_api.loading && _api.bufferTime < _api.currentTime) ||
          //readyState < 3代表视频就绪状态不足以播放。
          _api.readyState < 3
        ) {
          yield put({
            type: `loading`,
            payload: {
              loading: true,
            },
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
            delayTime: _config.controlbarHideTime,
          });
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
              payload: {
                loading: false,
              },
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
            payload: {
              loading: false,
            },
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
        if (_api.isError && !_api.living) {
          yield put({
            type: `errorMessage`,
            payload: {
              message: null,
            },
          });
          yield put({
            type: `play`,
          });
        }
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        yield put({
          type: `${timeNamespace}/timeSaga`,
          payload: {
            ...payload,
            duration: (fragment && fragment.duration) || payload.duration,
            currentTime:
              payload.currentTime +
              (payload.currentTime === 0 ? 0 : _api.videoGaps),
          },
        });
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
        _api.fragmentDuration = fragment.duration;
        if (_api.currentTime === 0) {
          //循环播放会重头放，需要重置
          _api.videoGaps = 0;
        }
        const { duration: fragmentDuration, data: fragmentData } = fragment;
        //begin----处理selection
        const selection = reduxStore.selection;
        let selectionBeginPercent;
        if (_config.selection && !_config.isHistory) {
          //history是fragment的另一版本，多个视频，fragment是一个视频
          if (selection.end > fragment.duration) {
            selection.end = fragment.duration;
          }
          if (
            _api.currentTime + _api.videoGaps < selection.begin ||
            _api.currentTime + _api.videoGaps > selection.end
          ) {
            if (_api.notAutoPlayViewHide && !_config.autoplay) {
              yield put({
                type: `loading`,
                payload: {
                  loading: true,
                },
              });
            }
            selectionBeginPercent = selection.begin / fragment.duration;
          }
        }
        //end----处理selection
        let sliderPercent = 0;
        const { seeking, percent } = payload;
        if (seeking || selectionBeginPercent) {
          let position = (selectionBeginPercent || percent) * fragmentDuration;
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
          sliderPercent = selectionBeginPercent || percent;
          tempSeekingCurrentTime = position - _api.videoGaps;
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
      *seekingState({ payload }, { put, select }) {
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
          if (tempSeekingCurrentTime !== undefined) {
            _api.currentTime = tempSeekingCurrentTime;
          }
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
        if (_api.readyState < 1 || isFirstPlay) {
          //首次播放，不给seeking
          //视频未就绪进来，不给操作，要不会报错
          return;
        }
        if (_api.ended) {
          yield put({
            type: `end`,
            payload: false,
          });
        }
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        if (!fragment || !fragment.data) {
          tempSeekingCurrentTime = _api.duration * percent;
          yield put({
            type: `${timeSliderNamespace}/timeSaga`,
            payload: {
              buffer: _api.bufferTime,
              currentTime: _api.duration * percent,
              duration: _api.duration,
            },
          });
        } else {
          yield put({
            type: 'fragment',
            payload: {
              seeking: true,
              percent,
            },
          });
        }
        _api.trigger('seek', percent);
      },
      *selection(
        {
          payload: { percent, type, duration },
        },
        { put, select }
      ) {
        const reduxStore = yield select();
        const fragment = reduxStore.fragment;
        const selection = reduxStore.selection;
        if (!duration) {
          duration = fragment.duration;
        }
        if (selection.end > duration) {
          selection.end = duration;
        }
        if (type === 'left-blur') {
          if (!_config.isHistory) {
            //history是fragment的另一版本，多个视频，fragment是一个视频
            yield put({
              type: `seeking`,
              payload: {
                percent,
              },
            });
          }
          let begin = percent * duration;
          //对外提供selection事件
          _api.trigger('selection', {
            ...selection,
            begin,
          });
        } else if (type === 'left-change') {
          let begin = percent * duration;
          if (begin > selection.end - selection.minGap) {
            begin = selection.end - selection.minGap;
            if (selection.end < selection.minGap) {
              begin = 0;
            }
          }
          if (selection.end - begin > selection.maxGap) {
            begin = selection.end - selection.maxGap;
          }
          yield put({
            type: `${selectionNamespace}/dataReducer`,
            payload: {
              ...selection,
              begin,
            },
          });
        } else if (type === 'right-change') {
          let end = percent * duration;
          if (selection.begin > end - selection.minGap) {
            end = selection.begin + selection.minGap;
            if (selection.end < selection.minGap) {
              end = duration;
            }
          }
          if (end - selection.begin > selection.maxGap) {
            end = selection.maxGap + selection.begin;
          }
          yield put({
            type: `${selectionNamespace}/dataReducer`,
            payload: {
              ...selection,
              end,
            },
          });
        } else if (type === 'right-blur') {
          let end = percent * duration;
          //对外提供selection事件
          _api.trigger('selection', {
            ...selection,
            end,
          });
        }
      },
      *fullscreen({ payload }, { put }) {
        if (fullscreenObj) {
          fullscreenObj.remove();
        }
        const fullscreenDom = _api.parentNode.parentNode;
        fullscreenObj = new fullscreenHelper(
          fullscreenDom,
          _api.ownerDocument,
          function() {
            const isFull = fullscreenObj.fullscreenElement();
            if (isFull) {
              fullscreenDom.style.width = '100%';
              fullscreenDom.style.display = 'block';
              fullscreenDom.style.height = '100%';
            } else {
              fullscreenDom.style.width = '';
              fullscreenDom.style.display = '';
              fullscreenDom.style.height = '';
            }
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
            delayTime: _config.controlbarHideTime,
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
        clearTimeout(errorMessageTimeout);
        if (_api.ended) {
          return;
        }
        const error = () => {
          //先清除，可能遗留的
          _dispatch({
            type: `${namespace}/controlbarClearTimeout`,
          });
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
                payload: {
                  loading: false,
                },
              });
            }
            _dispatch({
              type: `${namespace}/pause`,
            });
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
        //报错保存之前的播放进度
        if (!_state.lastCurrentTime) {
          _state.lastCurrentTime = _api.currentTime;
        }
        let retryReloadTime = 1;
        if (payload) {
          retryReloadTime = payload.retryReloadTime;
        }
        isReloading = true;
        _api.trigger('reload');
        //重置
        _api.reset();
        _api.detachMedia && _api.detachMedia();
        _videoEvents && _videoEvents.reset();
        yield put({
          type: `errorMessage`,
          payload: {
            message: null,
          },
        });
        yield put({
          type: `controlbar`,
          payload: false,
        });
        yield put({
          type: `loading`,
          payload: {
            loading: true,
            message: _config.localization.reloading,
            retryReloadTime,
            type: 'reload',
          },
        });
        _config.reload(() => {
          _api.reloading = true;
          _api.isError = false;
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
      setHistoryCurrentTime(
        {
          payload: { historyCurrentTime },
        },
        { put }
      ) {
        if (_api) {
          _api.historyCurrentTime = historyCurrentTime;
        }
      },
      //注意，回调函数中用不了put，改用dispatch，如果使用dispatch就需要绑上namespace
      *init({ payload, initOverCallback }, { put }) {
        _initPayload = payload;
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
          if (!isReloading) {
            //重连不处理
            yield put({
              type: `loading`,
              payload: {
                loading: true,
              },
            });
          }
          //controlbar播放按钮状态，只是切换状态，没有触发video播放，video loaded后才触发
          yield put({
            type: `${playPauseNamespace}/playPauseSaga`,
            payload: true,
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
        if (_config.selection && isFirstPlay) {
          const payload = {
            begin: 0,
            //5分钟
            end: 5 * 60,
            ..._config.selection,
          };
          yield put({
            type: `${selectionNamespace}/dataReducer`,
            payload,
          });
        }
        //防止事件没移除
        _api.off();
        //等待video运行起来后运行，对外提供接口
        const _outSideApi = outSideApi(payload, this.sagas);
        initOverCallback && initOverCallback(_outSideApi);
        //----begin 事件处理
        //需要再 initOverCallback之后执行
        if (autoplay || isReloading) {
          //重连也需要运行
          //autoplay=flase时需要再手动播放后运行
          _videoEvents = videoEvents(payload, isFirstPlay, _state);
          isFirstPlay = false;
        }
        if (hlsjsEvents) {
          hlsjsEvents(payload);
        }
        //----end 事件处理
        isReloading = false;
      },
    },
  };
}
