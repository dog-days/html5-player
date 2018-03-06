/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 */
import sinon from 'sinon';

import { q, childListChangeObserver } from '../../../util';

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
    this.timeout(5000);
    it('props.tracks should work,when kind is "captions".', function() {
      childListChangeObserver('.html5-player-captions-text', function() {
        done();
      });
    });
    it('props.tracks should work,when kind is "thumbnail".', function(done) {
      childListChangeObserver('.html5-player-container', function() {
        childListChangeObserver('.html5-player-time-slider', function() {
          //eslint-disable-next-line
          expect(!!q('.html5-player-thumbnail')).to.be.true;
          resolve();
          done();
        });
      });
    });
  });
}
