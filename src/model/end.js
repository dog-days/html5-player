export const namespace = 'end';
export default function() {
  return {
    namespace,
    state: false,
    reducers: {
      endStateReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *endStateSaga({ payload }, { put }) {
        yield put({
          type: 'endStateReducer',
          payload,
        });
      },
    },
  };
}
