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
  const sagas = ['muted'];
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
  describe('Props', function() {
    this.timeout(5000);
    it(`Play view should be shown when player config autoplay is set to false or undefined.`, function() {
      //eslint-disable-next-line
      expect(!!_config.autoplay).to.be.false;
      const playViewDom = q('.html5-player-play-view');
      //eslint-disable-next-line
      expect(!!playViewDom.innerHTML).to.be.true;
    });
    it(itTitle('preload'), function() {
      //autoplay=flase才会生效
      const playViewDom = q('.html5-player-play-view');
      //eslint-disable-next-line
      expect(!!playViewDom.innerHTML).to.be.true;
      //eslint-disable-next-line
      expect(!!q('.html5-player-tag').getAttribute('src')).to.be.false;
    });
    it(itTitle('muted'), function(done) {
      // childListChangeObserver('.html5-player-container', function() {
      //初始化会默认自动设置一次声音大小 + 设置为0的一次
      expect(spyObj.muted.callCount).to.equal(1);
      //要设置isLiving，隐藏timeslider，这样就只有一个.html5-player-slider-track
      const sliderTrackDom = q('.html5-player-slider-track');
      expect(sliderTrackDom.style.height).to.equal('0%');
      //icon展示也要想要改变
      let volumeIconDom = q('.html5-player-volume-x-icon');
      //eslint-disable-next-line
      expect(!!volumeIconDom).to.be.true;
      done();
    });
    it(itTitle('isLiving'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-time-container')).to.be.false;
      //eslint-disable-next-line
      expect(!!q('.html5-player-time-slider')).to.be.false;
    });
    it(itTitle('height'), function() {
      //eslint-disable-next-line
      expect(q('.html5-player-container').style.height).to.equal('500px');
    });
    it('props.aspectratio should not work,when props.width is not set.', function(done) {
      //width不设置默认是100%，aspectratio将失效。
      expect(q('.html5-player-container').clientWidth).to.equal(
        document.body.clientWidth
      );
      setTimeout(function() {
        resolve();
        done();
      }, 100);
    });
  });
}
