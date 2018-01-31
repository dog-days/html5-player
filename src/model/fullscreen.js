export const namespace = 'fullscreen';
export default function() {
  return {
    namespace,
    state: false,
    reducers: {
      fullscreenReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *fullscreenSaga({ payload }, { put }) {
        yield put({
          type: 'fullscreenReducer',
          payload,
        });
      },
    },
  };
}
