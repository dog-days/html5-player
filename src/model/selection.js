// import { standardReducer } from '../utils/util';
export const namespace = 'selection';
export default function() {
  return {
    namespace,
    state: null,
    reducers: {
      dataReducer: function(state, action) {
        return action.payload;
      },
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
