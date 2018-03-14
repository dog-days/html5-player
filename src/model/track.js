import { standardReducer } from '../utils/util';
import fetch from '../utils/fetch';
import srtParser from '../utils/srt';

//请求取消函数
let cancel;

function fetchTrack(url, params) {
  const cancelSource = fetch.getCancelSource();
  cancel = cancelSource.cancel;
  return fetch
    .get(url, { responseType: 'text', params, cancelToken: cancelSource.token })
    .catch(error => {
      return false;
    });
}

export const namespace = 'track';
export default function() {
  return {
    namespace,
    state: {
      subtitleId: -1,
      subtitleList: [],
      subtitleCues: null,
      thumbnails: null,
    },
    reducers: {
      trackReducer: standardReducer,
      clear: function(state, { payload }) {
        cancel && cancel();
        return this.state;
      },
    },
    sagas: {
      *subtitleListSaga(
        { payload: { subtitleList, subtitleId } },
        { put, call }
      ) {
        const data = {
          subtitleId,
        };
        if (subtitleList) {
          data.subtitleList = subtitleList;
        }
        yield put({
          type: 'trackReducer',
          payload: data,
        });
      },
      *hlsSubtitleCuesSaga({ payload }, { put, call }) {
        yield put({
          type: 'trackReducer',
          payload: {
            subtitleCues: payload,
          },
        });
      },
      *subtitleCuesSaga({ payload }, { put, call }) {
        const vtt = yield call(fetchTrack, payload.file);
        if (!vtt) {
          return;
        }
        const data = srtParser(vtt);
        yield put({
          type: 'trackReducer',
          payload: {
            subtitleCues: data,
          },
        });
      },
      *thumbnailSaga({ payload }, { put, call }) {
        const vtt = yield call(fetchTrack, payload.file);
        if (!vtt) {
          return;
        }
        const data = srtParser(vtt);
        data.forEach(v => {
          let url = payload.file
            .split('?')[0]
            .split('/')
            .slice(0, -1)
            .join('/');
          if (~v.text.indexOf('://')) {
            url = v.text;
          } else {
            url += '/' + v.text;
          }
          if (~url.indexOf('#xywh')) {
            //一张图片中有多张缩略图
            let matched = /(.+)#xywh=(\d+),(\d+),(\d+),(\d+)/.exec(url);
            v.thumbnail = matched;
          } else {
            //单张图片直接做缩略图
            v.thumbnail = url;
          }
        });
        yield put({
          type: 'trackReducer',
          payload: {
            thumbnails: data,
          },
        });
      },
    },
  };
}
