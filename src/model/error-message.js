export const namespace = 'error-message';
export default function() {
  return {
    namespace,
    state: {
      message: null,
    },
    reducers: {
      errorMessageReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *errorMessageSaga({ payload }, { put }) {
        yield put({
          type: 'errorMessageReducer',
          payload,
        });
      },
    },
  };
}
