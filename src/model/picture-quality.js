import { standardReducer } from '../utils/util';

export const namespace = 'picture-quality';
export default function() {
  return {
    namespace,
    state: {
      list: null,
      //-1为自动
      currentQuality: -1,
    },
    reducers: {
      dataReducer: standardReducer,
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *dataSaga({ payload }, { put }) {
        yield put({
          type: 'dataReducer',
          payload,
        });
      },
    },
  };
}
