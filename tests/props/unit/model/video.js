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
    it(`Play view should be hide when player config autoplay is set to true.`, function() {
      //eslint-disable-next-line
      expect(!!_config.autoplay).to.be.true;
      const playViewDom = q('.html5-player-play-view');
      //eslint-disable-next-line
      expect(!!playViewDom).to.be.false;
    });
    it('props.preload should not work,when autoplay=true.', function() {
      //eslint-disable-next-line
      expect(!!_config.preload).to.be.false;
      //eslint-disable-next-line
      expect(!!q('.html5-player-tag').getAttribute('src')).to.be.true;
    });
    it(itTitle('title'), function() {
      //eslint-disable-next-line
      expect(q('.html5-player-title').innerText).to.equal('test');
    });
    it(itTitle('width'), function() {
      //eslint-disable-next-line
      expect(q('.html5-player-container').style.width).to.equal('500px');
    });
    it(itTitle('aspectratio'), function() {
      //aspectratio设置为4:3了
      //aspectratio只有设置了width才会生效的，width和height都设置那么aspctration将失效。
      //eslint-disable-next-line
      expect(q('.html5-player-container').style.height).to.equal(
        `${500 * 3 / 4}px`
      );
    });
    it(
      itTitle('controls', 'when controls.playPause set to false.'),
      function() {
        //eslint-disable-next-line
        expect(!!q('.html5-player-play-pause-icon')).to.be.false;
      }
    );
    it(itTitle('controls', 'when controls.volume set to false.'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-volume-icon')).to.be.false;
    });
    it(
      itTitle('controls', 'when controls.fullscreen set to false.'),
      function() {
        //eslint-disable-next-line
        expect(!!q('.html5-player-screen-full-off-icon')).to.be.false;
      }
    );
    it(itTitle('controls', 'when controls.rotate set to true.'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-rotate-icon')).to.be.true;
    });
    it(
      itTitle('controls', 'when controls.timeSlider set to false.'),
      function() {
        //eslint-disable-next-line
        expect(!!q('.html5-player-time-slider')).to.be.false;
      }
    );
    it(itTitle('controls', 'when setting is set to true.'), function(done) {
      childListChangeObserver('.html5-player-controlbar', function() {
        //eslint-disable-next-line
        expect(!!q('.html5-player-setting-icon')).to.be.true;
        done();
      });
    });
    //下面的controls配置需要在上一个用childListChangeObserver的it之后
    it(itTitle('controls', 'when speed is set to true.'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-rate-button')).to.be.true;
    });
    it(itTitle('controls', 'when download button custumed .'), function() {
      //eslint-disable-next-line
      expect(!!q('.test-icon-down')).to.be.true;
    });

    it(itTitle('muted'), function() {
      expect(spyObj.muted.callCount).to.equal(1);
    });
    it(itTitle('logo'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-logo-container')).to.be.true;
    });
    it(itTitle('poster'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-tag').getAttribute('poster')).to.be.true;
    });
    it(itTitle('playbackRates'), function() {
      //eslint-disable-next-line
      expect(q('.html5-player-rate-container').children.length).to.equal(2);
    });
    it(itTitle('capture'), function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-capture-icon')).to.be.true;
    });
    it(itTitle('contextMenu'), function(done) {
      //eslint-disable-next-line
      expect(q('.html5-player-list-container').children.length).to.equal(2);
      setTimeout(function() {
        resolve();
        done();
      }, 100);
    });
  });
}
