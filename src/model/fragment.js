import { standardReducer } from '../utils/util';
import fetch from '../utils/fetch';
import { hms } from '../utils/util';
import isString from 'lodash/isString';

//请求取消函数
let cancel;

function fetchFragment(url, params) {
  const cancelSource = fetch.getCancelSource();
  cancel = cancelSource.cancel;
  return fetch
    .get(url, { params, cancelToken: cancelSource.token })
    .catch(error => {
      return false;
    });
}

export const namespace = 'fragment';
export default function() {
  return {
    namespace,
    state: {
      percent: null,
      duration: null,
      timeDuration: null,
      data: null,
    },
    reducers: {
      fragmentReducer: standardReducer,
      //合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
      //但是这个视频不是整个时段的，会有断的，为了给用户知道这段录像哪里断了，需要而外处理
      //sldierReducer这里是为了算出播放中，遇到断片的情况，进行一些跳过处理
      sliderReducer: standardReducer,
      clear: function(state, { payload }) {
        cancel && cancel();
        return this.state;
      },
    },
    sagas: {
      *fragmentSaga({ payload }, { put, call }) {
        let data;
        if (isString(payload)) {
          //fragment为url的情况
          data = yield call(fetchFragment, payload);
        } else {
          data = payload;
        }
        if (!data) {
          return;
        }
        const { total, fragments } = data;
        if (!total || !fragments) {
          return;
        }
        //需要做safari的日期格式兼容。
        total.begin = +new Date(total.begin.replace(/-/g, '/')) / 1000;
        total.end = +new Date(total.end.replace(/-/g, '/')) / 1000;
        const dataAfterAdapter = [];
        let duration = total.end - total.begin;
        let gaps = 0;
        fragments.forEach(obj => {
          if (!obj.begin || !obj.end) {
            return;
          }
          obj.begin = +new Date(obj.begin.replace(/-/g, '/')) / 1000;
          obj.end = +new Date(obj.end.replace(/-/g, '/')) / 1000;
          // duration中无视频的开始结束的时间，按秒算
          const begin = obj.begin - total.begin;
          const end = obj.end - total.begin;
          // duration 无视频的大小，按秒算
          const gap = obj.end - obj.begin;
          gaps += gap;
          dataAfterAdapter.push({
            gap,
            //包括前面的gap
            gaps,
            begin,
            end,
          });
        });
        let fragmentData = {};
        if (dataAfterAdapter.length > 0) {
          fragmentData = {
            duration,
            timeDuration: hms(duration),
            data: dataAfterAdapter,
          };
        }
        fragmentData.videoBeginDateTime = total.begin;
        yield put({
          type: 'fragmentReducer',
          payload: fragmentData,
        });
      },
    },
  };
}
