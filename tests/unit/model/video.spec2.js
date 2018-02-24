// import * as sagaEffects from 'redux-saga/effects';
import sinon from 'sinon';

import getSagaModel from 'src/libs/provider/saga-model';
import videoModel from 'src/model/video';
// import { delay } from 'src/utils/util';

function getStore(props = {}) {
  const {
    reducers,
    preloadedState,
    models = [],
    middlewares = [],
    plugins = [],
    production = true,
  } = props;
  const sagaModel = getSagaModel(
    reducers,
    preloadedState,
    models,
    middlewares,
    plugins,
    production
  );
  const store = sagaModel.store();
  return store;
}
const namespace = 'video';
const model = videoModel();
const store = getStore({
  plugins: [
    {
      onError: (error, dispatch) => {
        console.trace(error);
        // console.error(error);
      },
    },
  ],
});
describe('video model', function() {
  it(`Video model namespace should be "${namespace}".`, function() {
    expect(model.namespace).to.equal(namespace);
  });
  it(`Video model sagas should be equaled.`, function() {
    //sagas的个数和名字要一致
    const sagas = [
      'loading',
      'playAfterNotAutoplay',
      'hideNotAutoPlayView',
      'play',
      'pause',
      'volume',
      'muted',
      'end',
      'replay',
      'time',
      'fragment',
      'seeking',
      'seekingState',
      'fullscreen',
      'controlbarClearTimeout',
      'controlbar',
      'errorMessage',
      'reload',
      'living',
      'playbackRate',
      'init',
    ];
    const modelSagasKeys = Object.keys(model.sagas);
    expect(modelSagasKeys.length).to.equal(sagas.length);
    sagas.forEach(v => {
      expect(!!~modelSagasKeys.indexOf(v)).to.equal(true);
    });
  });
  it(`Video model saga "loading" should be executed correctly.`, function(done) {
    const spy = sinon.spy(model.sagas.loading);
    model.sagas.loading = spy;
    //注册model
    store.register(model);
    // const loading = sinon.stub(model.sagas, 'loading');
    store.dispatch({
      type: `${namespace}/loading`,
      payload: true,
    });
    // console.log(loadingSpy.callCount);
    expect(spy.callCount).to.equal(1);
    done();
  });
});
