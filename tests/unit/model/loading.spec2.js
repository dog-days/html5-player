// import * as sagaEffects from 'redux-saga/effects';
import sinon from 'sinon';
import { put } from 'redux-saga/effects';

import getSagaModel from 'src/libs/provider/saga-model';
import loadingModel from 'src/model/loading';
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
const namespace = 'loading';
const model = loadingModel();
const store = getStore({
  plugins: [
    {
      onError: (error, dispatch) => {
        // console.trace(error);
        // console.error(error);
      },
    },
  ],
});

describe('video model', function() {
  it(`Loading model namespace should be "${namespace}".`, function() {
    expect(model.namespace).to.equal(namespace);
  });
  it(`Loading model sagas should be equaled.`, function() {
    //sagas的个数和名字要一致
    const sagas = ['setLoadingStateSaga'];
    const modelSagasKeys = Object.keys(model.sagas);
    expect(modelSagasKeys.length).to.equal(sagas.length);
    sagas.forEach(v => {
      expect(!!~modelSagasKeys.indexOf(v)).to.equal(true);
    });
  });
  it(`Video model saga "loading" should be executed correctly.`, function(done) {
    //注册model
    const spy = sinon.spy(model.sagas.setLoadingStateSaga);
    model.sagas.setLoadingStateSaga = spy;
    store.register(model);
    store.runSaga(function*() {
      let a = yield put({
        type: `${namespace}/setLoadingStateSaga`,
        payload: true,
      });
      console.log(a);
      // console.log(loadingSpy);
      expect(spy.callCount).to.equal(1);
      done();
    });
  });
});
