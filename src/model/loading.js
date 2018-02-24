export const namespace = 'loading';
export default function() {
  return {
    namespace,
    state: false,
    reducers: {
      loadingStateReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *setLoadingStateSaga({ payload }, { put }) {
        yield put({
          type: 'loadingStateReducer',
          payload,
        });
      },
    },
  };
}
