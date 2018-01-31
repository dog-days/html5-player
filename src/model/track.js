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
      captions: null,
      chapters: null,
      percent: null,
      thumbnails: null,
    },
    reducers: {
      trackReducer: standardReducer,
      //合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
      //但是这个视频不是整个时段的，会有断的，为了给用户知道这段录像哪里断了，需要而外处理
      //这里是为了算出播放中，遇到断片的情况，进行一些跳过处理，获取想要的值
      sliderReducer: standardReducer,
      clear: function(state, { payload }) {
        cancel && cancel();
        return this.state;
      },
    },
    sagas: {
      *captionsSaga({ payload }, { put, call }) {
        const vtt = yield call(fetchTrack, payload.file);
        if (!vtt) {
          return;
        }
        const data = srtParser(vtt);
        yield put({
          type: 'trackReducer',
          payload: {
            captions: data,
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
