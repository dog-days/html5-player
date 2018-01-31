export const namespace = 'playback-rate';
export default function() {
  return {
    namespace,
    state: 1,
    reducers: {
      dataReducer: function(state, { payload }){
        return payload;
      },
      clear: function(state, { payload }){
        return this.state;
      },
    },
    sagas: {
      *setPlaybackRateSaga({ payload }, { put }) {
        yield put({
          type: 'dataReducer',
          payload,
        });
      },
    },
  };
}
