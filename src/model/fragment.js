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
          //防止源数据被改动
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
        const total_begin = +new Date(total.begin.replace(/-/g, '/')) / 1000;
        const total_end = +new Date(total.end.replace(/-/g, '/')) / 1000;
        const dataAfterAdapter = [];
        let duration = total_end - total_begin;
        let gaps = 0;
        fragments.forEach(obj => {
          if (!obj.begin || !obj.end) {
            return;
          }
          const obj_begin = +new Date(obj.begin.replace(/-/g, '/')) / 1000;
          const obj_end = +new Date(obj.end.replace(/-/g, '/')) / 1000;
          // duration中无视频的开始结束的时间，按秒算
          const begin = obj_begin - total_begin;
          const end = obj_end - total_begin;
          // duration 无视频的大小，按秒算
          const gap = obj_end - obj_begin;
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
        fragmentData.videoBeginDateTime = total_begin;
        yield put({
          type: 'fragmentReducer',
          payload: fragmentData,
        });
      },
    },
  };
}
