export const namespace = 'not-autoplay';
export default function() {
  return {
    namespace,
    //not-autoplay页面是否展示
    state: true,
    reducers: {
      notAutoPlayStateReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *notAutoPlayStateSaga({ payload }, { put }) {
        yield put({
          type: 'notAutoPlayStateReducer',
          payload,
        });
      },
    },
  };
}
