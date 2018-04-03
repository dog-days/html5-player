export const namespace = 'rotate';
export default function() {
  return {
    namespace,
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
