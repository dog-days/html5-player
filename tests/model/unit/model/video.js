/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 */
import sinon from 'sinon';
import {
  childListChangeObserver,
  shouldChildNotEmptyObserver,
  shouldChildEmptyObserver,
  attributesChangeObserver,
  q,
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
    'init',
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
    'seekingState',
    'seeking',
    'fullscreen',
    'controlbarClearTimeout',
    'controlbar',
    'errorMessage',
    'reload',
    'living',
    'playbackRate',
    'subtitleList',
    'switchSubtitle',
    'rotate',
  ];
  sagas.forEach(v => {
    spyObj[v] = sinon.spy(model.sagas[v]);
    model.sagas[v] = spyObj[v];
  });
  spyObj.clear = sinon.spy(model.reducers.clear);
  model.reducers.clear = spyObj.clear;
}
function sagaItTitle(sagaName) {
  return `model/video/index "${sagaName}" saga should be executed correctly.`;
}
function dispatch(name, payload = {}) {
  _dispatch({ type: `${_model.namespace}/${name}`, payload });
}
export default function(player, resolve) {
  const videoDom = q('.html5-player-tag');
  describe('Model', function() {
    this.timeout(5000);
    it(sagaItTitle('init'), function() {
      expect(spyObj.init.callCount).to.equal(1);
    });
    it(sagaItTitle('loading'), function(done) {
      //这里是dom结构变化事件监控，异步的，应该在前面先监听，由下面的_dispatch触发dom结构改变
      shouldChildNotEmptyObserver('.html5-player-loading-view', done);
      dispatch('loading', true);
      expect(spyObj.loading.callCount).to.equal(1);
    });
    it(sagaItTitle('playAfterNotAutoplay'), function(done) {
      //这里是dom结构变化事件监控，异步的，应该在前面先监听，由下面的_dispatch触发dom结构改变
      shouldChildEmptyObserver('.html5-player-play-view', done);
      dispatch('playAfterNotAutoplay');
      expect(spyObj.playAfterNotAutoplay.callCount).to.equal(1);
    });
    it(sagaItTitle('hideNotAutoPlayView'), function() {
      //playAfterNotAutoplay会触发hideNotAutoPlayView执行。
      expect(spyObj.hideNotAutoPlayView.callCount).to.equal(1);
    });

    it(sagaItTitle('pause'), function(done) {
      //监听事件要放在dispatch前面
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.pause.callCount).to.equal(1);
        //controlbar中的暂停icon对应要切换为播放icon
        const iconPlayDom = q('.html5-player-play-icon');
        //eslint-disable-next-line
        expect(!!iconPlayDom).to.be.true;
        done();
      });
      dispatch('pause');
    });
    it(sagaItTitle('play'), function(done) {
      attributesChangeObserver('.html5-player-play-pause-icon', function() {
        expect(spyObj.play.callCount).to.equal(2);
        //controlbar中的播放icon对应要切换为暂停icon
        const iconPauseDom = q('.html5-player-pause-icon');
        //eslint-disable-next-line
        expect(!!iconPauseDom).to.be.true;
        done();
      });
      dispatch('play');
    });
    //这里执行在异步的test之前。
    let sliderTrackDomAll;
    let sliderTrackDom;
    function setSliderTrackDom() {
      //目前播放器有两个slider，声音和录像slider
      //这里需要判断视频两个slider都显示了。
      //播放状态改变后才controlbar才会显示。
      sliderTrackDomAll = document.querySelectorAll(
        '.html5-player-slider-track'
      );
      if (sliderTrackDomAll[1]) {
        sliderTrackDom = sliderTrackDomAll[1];
      } else {
        sliderTrackDom = sliderTrackDomAll[0];
      }
    }
    it(sagaItTitle('volume').replace('.', ' when the volume is 0.'), function(
      done
    ) {
      attributesChangeObserver('.html5-player-volume-icon', function() {
        setSliderTrackDom();
        //初始化会默认自动设置一次声音大小 + 设置为0的一次
        expect(spyObj.volume.callCount).to.equal(2);
        expect(sliderTrackDom.style.height).to.equal('0%');
        //icon展示也要想要改变
        let volumeIconDom = q('.html5-player-volume-x-icon');
        //eslint-disable-next-line
        expect(!!volumeIconDom).to.be.true;
        done();
      });
      dispatch('volume', 0);
    });
    it(sagaItTitle('volume').replace('.', ' when the volume is 50.'), function(
      done
    ) {
      attributesChangeObserver('.html5-player-volume-icon', function() {
        //2 + 1
        expect(spyObj.volume.callCount).to.equal(3);
        expect(sliderTrackDom.style.height).to.equal('50%');
        //icon展示也要想要改变
        let volumeIconDom = q('.html5-player-volume-part-icon');
        //eslint-disable-next-line
        expect(!!volumeIconDom).to.be.true;
        done();
      });
      dispatch('volume', 50);
    });
    it(sagaItTitle('volume').replace('.', ' when the volume is 100.'), function(
      done
    ) {
      attributesChangeObserver('.html5-player-volume-icon', function() {
        //3 + 1
        expect(spyObj.volume.callCount).to.equal(4);
        expect(sliderTrackDom.style.height).to.equal('100%');
        //icon展示也要想要改变
        let volumeIconDom = q('.html5-player-volume-full-icon');
        //eslint-disable-next-line
        expect(!!volumeIconDom).to.be.true;
        done();
      });
      dispatch('volume', 100);
    });

    it(sagaItTitle('muted'), function(done) {
      attributesChangeObserver('.html5-player-volume-icon', function() {
        //初始化会默认自动设置是否静音（根据localStorage） + 设置为0的一次
        expect(spyObj.muted.callCount).to.equal(1);
        expect(sliderTrackDom.style.height).to.equal('0%');
        //icon展示也要想要改变
        let volumeIconDom = q('.html5-player-volume-x-icon');
        //eslint-disable-next-line
        expect(!!volumeIconDom).to.be.true;
        done();
      });
      dispatch('muted', true);
    });
    it(sagaItTitle('end'), function(done) {
      this.timeout(10000);
      //这里因为需要验证视频结束的状态，有网络请求，所有比较慢
      //需要设置较长的超时时间，默认超时时间为2 * 1000
      //而且如果网络不好，还可能出错，所有如果这里测试不通过，需要先排除网络问题。
      this.timeout(8 * 1000);
      videoDom.currentTime = 1000000;
      shouldChildNotEmptyObserver('.html5-player-end-view', function() {
        expect(spyObj.end.callCount).to.equal(1);
        done();
      });
    });
    it(sagaItTitle('replay'), function(done) {
      //这里是dom结构变化事件监控，异步的，应该在前面先监听，由下面的_dispatch触发dom结构改变
      shouldChildEmptyObserver('.html5-player-end-view', function() {
        expect(spyObj.replay.callCount).to.equal(1);
        done();
      });
      dispatch('replay');
    });
    it(sagaItTitle('time'), function() {
      //虽然不知道具体数，但是大于2这个是100%了，除非视频播放出错了，那这个测试上面的就通不过了。
      //eslint-disable-next-line
      expect(spyObj.time.callCount > 2).to.be.true;
    });
    it(sagaItTitle('seekingState'), function() {
      dispatch('seekingState', true);
      expect(spyObj.seekingState.callCount).to.equal(1);
    });
    it(sagaItTitle('seeking'), function() {
      const percent = 0.5;
      dispatch('seeking', { percent });
      expect(spyObj.seeking.callCount).to.equal(1);
      // console.log(videoDom.currentTime, videoDom.duration * percent);
      //eslint-disable-next-line
      expect(videoDom.currentTime === videoDom.duration * percent).to.be.true;
    });
    it(sagaItTitle('subtitleList'), function() {
      expect(spyObj.subtitleList.callCount).to.equal(1);
    });
    it(sagaItTitle('switchSubtitle'), function() {
      dispatch('switchSubtitle', 0);
      expect(spyObj.switchSubtitle.callCount).to.equal(1);
    });
    it(sagaItTitle('fullscreen'), function() {
      //测试中浏览器全屏功能失效
      dispatch('fullscreen', true);
      expect(spyObj.fullscreen.callCount).to.equal(1);
    });
    it(sagaItTitle('controlbarClearTimeout'), function() {
      //会运行多次
      //eslint-disable-next-line
      expect(spyObj.controlbarClearTimeout.callCount > 1).to.be.true;
    });
    it(sagaItTitle('controlbar'), function() {
      //会运行多次
      //eslint-disable-next-line
      expect(spyObj.controlbar.callCount > 1).to.be.true;
    });
    it(
      sagaItTitle('errorMessage').replace(
        '.',
        ' when there is an error message.'
      ),
      function(done) {
        shouldChildNotEmptyObserver('.html5-player-error-message-view', done);
        dispatch('errorMessage', { message: 'test' });
        expect(spyObj.errorMessage.callCount).to.equal(1);
      }
    );
    it(
      sagaItTitle('errorMessage').replace(
        '.',
        ' when there is no error message.'
      ),
      function(done) {
        shouldChildEmptyObserver('.html5-player-error-message-view', done);
        dispatch('errorMessage', { message: null });
        expect(spyObj.errorMessage.callCount).to.equal(2);
      }
    );
    it(sagaItTitle('playbackRate'), function(done) {
      //要在living saga之前，因为living为true时，speed的dom会被移除。
      attributesChangeObserver('.html5-player-rate-selected', function() {
        expect(q('.html5-player-rate-selected').children[0].innerHTML).to.equal(
          '1.5倍速'
        );
        done();
      });
      dispatch('playbackRate', 1.5);
      expect(spyObj.playbackRate.callCount).to.equal(1);
      expect(videoDom.playbackRate).to.equal(1.5);
    });
    it(
      sagaItTitle('living').replace(
        '.',
        ' when swiching the video to live status.'
      ),
      function(done) {
        const lastCount = spyObj.living.callCount;
        childListChangeObserver('.html5-player-controlbar', function() {
          //初始化默认会触发一次
          expect(spyObj.living.callCount).to.equal(lastCount + 1);
          //html5-player-time-slider
          //直播无time-slider
          expect(!!q('.html5-player-time-slider')).to.equal(false);
          done();
        });
        dispatch('living', { duration: Infinity });
      }
    );
    it(sagaItTitle('reload'), function(done) {
      //reload后video标签中src属性会被改变（加上随机数，确保跟上一个的url不相等）。
      attributesChangeObserver('.html5-player-tag', function() {
        expect(spyObj.clear.callCount).to.equal(1);
        resolve({
          lastModel: _model,
          lastDispatch: _dispatch,
          lastSpyObj: spyObj,
        });
        done();
      });
      dispatch('reload');
      expect(spyObj.reload.callCount).to.equal(1);
    });
  });
}
