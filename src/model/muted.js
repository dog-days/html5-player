export const namespace = 'muted';
export default function() {
  return {
    namespace,
    //默认不静音
    state: false,
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
        yield put({
          type: 'dataReducer',
          payload,
        });
      },
    },
  };
}
