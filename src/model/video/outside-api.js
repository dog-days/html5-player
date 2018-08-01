import { namespace } from './index';
import { namespace as selectionNamespace } from '../selection';

//忽略的saga名，不忽略的saga名注意不要跟下面的properties重复
const outSideSagas = [
  'play',
  'pause',
  'volume',
  'muted',
  'replay',
  'seeking',
  'fullscreen',
  'controlbar',
  'errorMessage',
  'playbackRate',
];

const oustSidePropertyList = [
  'playing',
  'ended',
  'loading',
  'bufferTime',
  'seekingState',
  'currentTime',
  'duration',
  'isError',
];

class OutsideApi {
  // eslint-disable-next-line
  constructor(payload, sagas) {
    this.api = payload.api;
    this.dispatch = payload.dispatch;
    this.config = payload.config;
    this.autoplay = payload.config.autoplay;
    this.sagas = sagas;
    const api = payload.api;
    //begin--对外提供的借口
    const outSideApi = {
      on: api.on.bind(api),
      off: api.off.bind(api),
      setCurrentTime: currentTime => {
        this.api.currentTime = currentTime;
      },
    };
    this.getSagaFunction(outSideApi);
    this.getProperty(outSideApi);
    payload.videoCallback && payload.videoCallback(outSideApi);
    return outSideApi;
  }
  getSagaFunction(outSideApi) {
    const dispatch = this.dispatch;
    for (let k in this.sagas) {
      const sagaName = k.replace(`${namespace}/`, '');
      if (!!~outSideSagas.indexOf(sagaName)) {
        let funcName;
        switch (sagaName) {
          case 'volume':
            funcName = 'setVolume';
            break;
          case 'muted':
            funcName = 'setMuted';
            break;
          case 'seeking':
            funcName = 'setSeeking';
            break;
          case 'errorMessage':
            funcName = 'showErrorMessage';
            break;
          case 'playbackRate':
            funcName = 'setPlaybackRate';
            break;
          default:
            funcName = sagaName;
        }
        // eslint-disable-next-line
        outSideApi[funcName] = (...params) => {
          const action = {
            type: k,
          };
          switch (sagaName) {
            case 'seeking':
              if (!this.config.isHistory) {
                action.payload = { percent: params[0], pause: true };
              }
              break;
            case 'controlbar':
              action.payload = params[0];
              action.delayTime = params[1];
              action.onControlbarEnter = params[2];
              break;
            case 'errorMessage':
              action.payload = { message: params[0] };
              break;
            default:
              if (params[0]) {
                action.payload = params[0];
              }
          }
          if (this.config.isHistory && sagaName === 'seeking') {
            console.warn('history cannot use seeking');
          } else {
            dispatch(action);
          }
        };
      }
    }
    outSideApi['setSelection'] = payload => {
      const action = {
        type: `${selectionNamespace}/dataReducer`,
        payload,
      };
      dispatch(action);
      //对外提供selection事件
      this.api.trigger('selection', {
        ...action.payload,
      });
    };
  }
  getProperty(outSideApi) {
    oustSidePropertyList.forEach(v => {
      let key = v;
      if (v === 'seekingState') {
        key = 'seeking';
      }
      Object.defineProperty(outSideApi, key, {
        get: () => {
          if (key === 'duration' && this.config.historyDuration) {
            return this.config.historyDuration;
          }
          if (key === 'currentTime') {
            return this.api.historyCurrentTime;
          }
          return this.api[v];
        },
        set: function() {
          throw new Error(`${v} is read only!`);
        },
        enumerable: true,
      });
    });
  }
}
export default function(payload, sagas) {
  return new OutsideApi(payload, sagas);
}
