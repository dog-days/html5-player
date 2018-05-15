import { standardReducer, hms } from '../utils/util';

export const namespace = 'time';
export default function() {
  return {
    namespace,
    state: {
      currentTime: 0,
      elapse: '00:00',
      duration: '00:00',
      //原始video的duration，为了让其他地方使用，存一份
      secondDuration: 0,
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
          payload: { currentTime, duration = 0 },
        },
        { put }
      ) {
        //currentTime和duration会有误差，最大的currentTime基本都比duration小，+0.25是为了减少time中的误差。
        const elapse = hms(Math.min(currentTime + 0.25, duration));
        const timeDuration = hms(duration);
        yield put({
          type: 'timeReducer',
          payload: {
            elapse,
            duration: timeDuration,
            secondDuration: duration,
            currentTime,
          },
        });
      },
    },
  };
}
