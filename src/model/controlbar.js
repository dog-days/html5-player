export const namespace = 'controlbar';
export default function() {
  return {
    namespace,
    state: false,
    reducers: {
      controlbarReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *controlbarSaga({ payload }, { put }) {
        yield put({
          type: `controlbarReducer`,
          payload,
        });
      },
    },
  };
}
