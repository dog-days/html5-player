// import { standardReducer } from '../utils/util';

export const namespace = 'volume';
export default function() {
  return {
    namespace,
    //100为自定义的总音量，原生的最大为1
    //先设置声音为20，太大可能一开始就造成声音过多，用户体验不好。
    state: 20,
    reducers: {
      dataReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *dataSaga({ payload }, { put }) {
        if (payload && isNaN(payload)) {
          //兼容volume不为数字的情况
          payload = 0;
        }
        yield put({
          type: 'dataReducer',
          payload,
        });
      },
    },
  };
}
