export const namespace = 'play-pause';
export default function() {
  return {
    namespace,
    //是否播放
    state: false,
    reducers: {
      playPauseReducer: function(state, { payload }) {
        return payload;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *playPauseSaga({ payload }, { put }) {
        yield put({
          type: 'playPauseReducer',
          payload,
        });
      },
    },
  };
}
