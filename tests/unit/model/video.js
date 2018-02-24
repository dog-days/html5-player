import sinon from 'sinon';

const spyObj = {};
let _model;
let _dispatch;
export function getModelObject(model, dispatch) {
  _model = model;
  _dispatch = dispatch;
  spyObj.loading = sinon.spy(model.sagas.loading);
  model.sagas.loading = spyObj.loading;
}
export default function(player) {
  describe('video model', function() {
    it(`Video model "loading" saga should be executed correctly.`, function() {
      _dispatch({ type: `${_model.namespace}/loading`, payload: true });
      // console.log(Object.keys(player), spyObj.loading.callCount);
      expect(spyObj.loading.callCount).to.equal(1);
    });
  });
}
