import { standardReducer } from '../utils/util';

export const namespace = 'time-slider';
export default function() {
  return {
    namespace,
    state: {
      //最大值为1
      position: 0,
      buffer: 0,
      duration: 0,
    },
    reducers: {
      timeReducer: standardReducer,
      clear: function(state, { payload }) {
        return this.state;
      },
    },
    sagas: {
      *timeSaga(
        {
          payload: { currentTime, duration = 0, buffer },
        },
        { put }
      ) {
        let percent = currentTime / duration;
        if (percent > 1) {
          percent = 1;
        }
        if (isNaN(percent)) {
          percent = 0;
        }
        if (isNaN(duration)) {
          duration = 0;
        }
        yield put({
          type: 'timeReducer',
          payload: {
            percent,
            buffer: buffer / duration,
            duration,
          },
        });
      },
    },
  };
}
