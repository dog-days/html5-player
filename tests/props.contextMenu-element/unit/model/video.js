/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 */
import sinon from 'sinon';

import { q } from '../../../util';

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
export default function(player, resolve) {
  describe('Props', function(done) {
    it('props.contextMenu should work,when contextMenu is react element.', function(done) {
      //eslint-disable-next-line
      expect(!!q('.context-menu-test')).to.be.true;
      //eslint-disable-next-line
      expect(q('.context-menu-test').children.length).to.equal(2);
      setTimeout(function() {
        resolve();
        done();
      }, 100);
    });
  });
}
