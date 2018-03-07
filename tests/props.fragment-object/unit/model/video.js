/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 */
import sinon from 'sinon';

const spyObj = {};
let _model;
let _dispatch;
let _store;
let _config;
export function getModelObject(model, config, dispatch, store) {
  _model = model;
  _dispatch = dispatch;
  _store = store;
  _config = config;
  const sagas = [];
  sagas.forEach(v => {
    spyObj[v] = sinon.spy(model.sagas[v]);
    model.sagas[v] = spyObj[v];
  });
}
function itTitle(propsStr, suffix = '.') {
  if (suffix !== '.') {
    suffix = ',' + suffix;
  }
  return `props.${propsStr} should work$$`.replace('$$', suffix);
}
export default function(player, resolve) {
  describe('Props', function(done) {
    it(itTitle('fragment', 'when fragment is object.'), function(done) {
      setTimeout(function() {
        expect(
          document.querySelectorAll('.html5-player-broken').length
        ).to.equal(3);
        resolve();
        done();
      }, 500);
    });
  });
}
