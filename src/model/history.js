import { namespace as videoNamespace } from './video';
import { namespace as timeSliderNamespace } from './time-slider';
import { standardReducer } from '../utils/util';

export const namespace = 'history';
export default function() {
  const state = {
    fragments: null,
    currentVideoIndex: null,
    file: null,
    percent: 0,
    defaultCurrentVideoTime: 0,
  };
  return {
    namespace,
    state: {
      ...state,
    },
    reducers: {
      setState: standardReducer,
      clear() {
        return state;
      },
    },
    sagas: {
      *time({ payload }, { put, select }) {
        const { currentTime: currentVideoTime } = payload;
        const {
          fragments,
          currentVideoIndex,
          duration: historyDuration,
        } = yield select(state => state[namespace]);
        const totalHistoryTimeBefore = getTotalHistoryTimeBeforeByIndex(
          currentVideoIndex,
          fragments
        );
        const historyCurrentTime = totalHistoryTimeBefore + currentVideoTime;
        yield put({
          type: 'setSliderPercent',
          payload: {
            percent: historyCurrentTime / historyDuration,
          },
        });
      },
      *playNextVideo({ payload }, { put, select }) {
        const {
          fragments,
          currentVideoIndex,
          duration: historyDuration,
        } = yield select(state => state[namespace]);
        const nextVideoIndex = currentVideoIndex + 1;
        const totalHistoryTimeBefore = getTotalHistoryTimeBeforeByIndex(
          nextVideoIndex,
          fragments
        );
        let percent = totalHistoryTimeBefore / historyDuration;
        yield put({
          type: 'setSliderPercent',
          payload: {
            selectedIndex: nextVideoIndex,
            percent,
          },
        });
      },
      *setSliderPercent({ payload }, { put, select }) {
        let { percent, selectedIndex } = payload;
        const {
          fragments,
          duration: historyDuration,
          currentVideoIndex: prevVideoIndex,
        } = yield select(state => state[namespace]);
        if (!selectedIndex) {
          selectedIndex = getVideoIndexBySliderPercent(
            percent,
            historyDuration,
            fragments
          );
        }
        const currentVideoIndex = getValidCurrentVideoIndex(
          selectedIndex,
          fragments
        );
        const currentVideoTime = getVideoCurrentTime(
          currentVideoIndex,
          historyDuration * percent,
          fragments
        );
        const isNoVideo = isNoVideoToBePlayed(selectedIndex, fragments);
        if (isNoVideo) {
          //没有可继续播放是视频，需要重头播放
          const totalHistoryTimeBefore = getTotalHistoryTimeBeforeByIndex(
            currentVideoIndex,
            fragments
          );
          percent = totalHistoryTimeBefore / historyDuration;
        }
        const { duration: currentVideoDuration = 0 } = yield select(
          state => state[timeSliderNamespace]
        );
        yield put({
          type: 'setState',
          payload: {
            percent,
            currentVideoIndex,
            file: fragments[currentVideoIndex].file,
            defaultCurrentVideoTime:
              prevVideoIndex !== currentVideoIndex
                ? currentVideoTime
                : undefined,
          },
        });
        // seek 当前播放视频
        if (
          currentVideoDuration !== 0 &&
          //index 不一样需要播放下一个视频
          //无需seeking，使用 defaultCurrentVideoTime
          prevVideoIndex === currentVideoIndex
        ) {
          let currentVideoPercent = currentVideoTime / currentVideoDuration;
          if (isNoVideo) {
            //没有可继续播放是视频，需要重头播放
            currentVideoPercent = 0;
          }
          yield put({
            type: `${videoNamespace}/seeking`,
            payload: {
              percent: currentVideoPercent,
            },
          });
        }
        //对外 API 设置 history 的 currentTime
        yield put({
          type: `${videoNamespace}/setHistoryCurrentTime`,
          payload: {
            historyCurrentTime: percent * historyDuration,
          },
        });
      },
      *set({ payload }, { put }) {
        let {
          fragments,
          duration: historyDuration,
          defaultCurrentTime,
        } = payload;
        const currentVideoIndex = getValidCurrentVideoIndex(0, fragments);
        yield put({
          type: 'setState',
          payload: {
            fragments,
            currentVideoIndex,
            file: fragments[currentVideoIndex].file,
            duration: historyDuration,
          },
        });
        if (defaultCurrentTime > historyDuration) {
          console.error('The defaultCurrentTime is greater than the duration.');
          defaultCurrentTime = historyDuration;
        }
        if (defaultCurrentTime) {
          yield put({
            type: 'setSliderPercent',
            payload: {
              percent: defaultCurrentTime / historyDuration,
            },
          });
        }
      },
    },
  };
}

function getValidCurrentVideoIndex(index, fragments) {
  let k = 0;
  while (!fragments[index] || !fragments[index].file) {
    if (index >= fragments.length - 1) {
      index = 0;
    } else {
      index++;
    }
    if (k > fragments.length) {
      //防止死循环
      break;
    }
    k++;
  }

  return index;
}
/**
 * 通过 silder 当前的百分比获取 videoIndex
 * @param {Number} sliderPercent
 * @param {Number} duration history duration
 * @param {Array} fragments historyList fragments
 * @returns {Number} fragments videoIndex
 */
function getVideoIndexBySliderPercent(
  sliderPercent,
  historyDuration,
  fragments
) {
  let videoIndex = 0;
  const currentTime = sliderPercent * historyDuration;
  for (let k = 0; k < fragments.length; k++) {
    const v = fragments[k];
    if (v.begin < currentTime && v.end > currentTime) {
      videoIndex = k;
      break;
    }
  }
  return videoIndex;
}
/**
 * 获取 指定视频段 前面所有视频 所占用的时间，即小于 index 的视频时间
 * @param {Number} index
 * @param {Array} fragments
 * @returns
 */
function getTotalHistoryTimeBeforeByIndex(index, fragments) {
  let historyTime = 0;
  for (let k = 0; k < fragments.length; k++) {
    const v = fragments[k];
    const gaps = v.end - v.begin;
    if (index > k) {
      historyTime += gaps;
    } else {
      break;
    }
  }
  return historyTime;
}
function getVideoCurrentTime(currentVideoIndex, historyCurrentTime, fragments) {
  let currentVideoTime = historyCurrentTime;
  for (let k = 0; k < fragments.length; k++) {
    const v = fragments[k];
    const gaps = v.end - v.begin;
    if (currentVideoIndex > k) {
      currentVideoTime -= gaps;
    } else {
      break;
    }
  }
  if (currentVideoTime < 0) {
    //点击到无视频的位置，才会有负数。
    currentVideoTime = 0;
  }

  return currentVideoTime;
}

/**
 * 视频播放完成，需要重头播放
 * @returns {Boolean}
 */
function isNoVideoToBePlayed(selectedIndex, fragments) {
  const index = getValidCurrentVideoIndex(selectedIndex, fragments);
  if (selectedIndex > index) {
    return true;
  }
}
