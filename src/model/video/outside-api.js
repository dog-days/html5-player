import { namespace } from './index';
//忽略的saga名，不忽略的saga名注意不要跟下面的properties重复
const outSideIgnoreSagas = [
  'loading',
  'hideNotAutoPlayView',
  'end',
  'time',
  'historyTrack',
  'seekingState',
  'controlbarClearTimeout',
  'reload',
  'living',
  'init',
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
    this.autoplay = payload.autoplay;
    this.sagas = sagas;
    const api = payload.api;
    //begin--对外提供的借口
    const outSideApi = {
      on: api.on.bind(api),
      off: api.off.bind(api),
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
      if (!~outSideIgnoreSagas.indexOf(sagaName)) {
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
              action.payload = { percent: params[0], pause: true };
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
          dispatch(action);
        };
      }
    }
  }
  getProperty(outSideApi) {
    oustSidePropertyList.forEach(v => {
      let key = v;
      if (v === 'seekingState') {
        key = 'seeking';
      }
      Object.defineProperty(outSideApi, key, {
        get: () => {
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
