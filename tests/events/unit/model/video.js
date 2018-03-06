/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 * model已经做了详细的测试，这里测试事件正常就ok
 */
import sinon from 'sinon';

import {
  q,
  mockMouseEvent,
  childListChangeObserver,
  attributesChangeObserver,
} from '../../../util';

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
  const sagas = [
    'playAfterNotAutoplay',
    'pause',
    'play',
    'controlbar',
    'muted',
    'fullscreen',
    'volume',
  ];
  sagas.forEach(v => {
    spyObj[v] = sinon.spy(model.sagas[v]);
    model.sagas[v] = spyObj[v];
  });
}
export default function(player, resolve) {
  describe('Events', function() {
    this.timeout(5000);
    it('Play button click event of notAutoplayView should work.', function(done) {
      childListChangeObserver('.html5-player-play-view', function() {
        expect(spyObj.playAfterNotAutoplay.callCount).to.equal(1);
        done();
      });
      mockMouseEvent(q('.html5-player-play-view').children[0], 'click');
    });
    it('Video click event should work,when video will be paused.', function(done) {
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.pause.callCount).to.equal(1);
        //controlbar中的暂停icon对应要切换为播放icon
        const iconPlayDom = q('.html5-player-play-icon');
        //eslint-disable-next-line
        expect(!!iconPlayDom).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-tag'), 'click');
    });
    it('Video click event should work,when video will be played.', function(done) {
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.play.callCount).to.equal(2);
        //controlbar中的播放icon对应要切换为暂停icon
        const iconPauseDom = q('.html5-player-pause-icon');
        //eslint-disable-next-line
        expect(!!iconPauseDom).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-tag'), 'click');
    });
    it('Controlbar pause button click event should work.', function(done) {
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.pause.callCount).to.equal(2);
        //controlbar中的暂停icon对应要切换为播放icon
        const iconPlayDom = q('.html5-player-play-icon');
        //eslint-disable-next-line
        expect(!!iconPlayDom).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-play-pause-icon'), 'click');
    });
    it('Controlbar play button click event should work.', function(done) {
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.play.callCount).to.equal(3);
        //controlbar中的播放icon对应要切换为暂停icon
        const iconPauseDom = q('.html5-player-pause-icon');
        //eslint-disable-next-line
        expect(!!iconPauseDom).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-play-pause-icon'), 'click');
    });
    it('Video mousemove event should work.', function() {
      const lastCount = spyObj.controlbar.callCount;
      //模拟的mousemove必触发一次controlbar才正常。
      mockMouseEvent(q('.html5-player-container'), 'mousemove');
      expect(spyObj.controlbar.callCount).to.equal(lastCount + 1);
    });
    it('Controlbar volume button should be set to muted after click event.', function() {
      mockMouseEvent(q('.html5-player-volume-icon'), 'click');
      expect(spyObj.muted.callCount).to.equal(1);
    });
    it('Controlbar volume button should be set to unmuted after click event.', function() {
      mockMouseEvent(q('.html5-player-volume-icon'), 'click');
      //初始化会有一次声音设置
      expect(spyObj.volume.callCount).to.equal(2);
    });
    it('Controlbar fullscreen button should work.', function() {
      mockMouseEvent(q('.html5-player-screen-full-off-icon'), 'click');
      expect(spyObj.fullscreen.callCount).to.equal(1);
    });
  });
}
