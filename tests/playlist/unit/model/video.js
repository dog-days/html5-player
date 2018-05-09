/**
 * 可能会受网络的影响，测试也会不通过的，所有需要保证网络没问题。
 */

import { q, mockMouseEvent, attributesChangeObserver } from '../../../util';

export default function(player, itemCount, resolve) {
  describe('Playlist', function() {
    const innerContainer = q('.html5-player-carousel-inner-contianer');
    it('Playlist count should be correct.', function() {
      //eslint-disable-next-line
      expect(innerContainer.children.length).to.equal(itemCount);
    });
    //html5-player-prev-icon
    it('Controlbar prev icon should not be rendered when activeItem === 1.', function() {
      //activeItem=1时，是第一个，prev按钮不渲染
      //eslint-disable-next-line
      expect(!!q('.html5-player-prev-icon')).to.be.false;
    });
    it('Controlbar next icon should be rendered.', function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-next-icon')).to.be.true;
    });

    it('Playlist active item should be render correctly.', function(done) {
      //eslint-disable-next-line
      expect(
        !!~innerContainer.children[0].classList.value
          .split(' ')
          .indexOf('html5-player-carousel-item-active')
      ).to.be.true;
      //eslint-disable-next-line
      attributesChangeObserver(innerContainer.children[1], function() {
        //eslint-disable-next-line
        expect(
          !!~innerContainer.children[1].classList.value
            .split(' ')
            .indexOf('html5-player-carousel-item-active')
        ).to.be.true;
        done();
      });
      //点击列表中的第二个视频
      mockMouseEvent(innerContainer.children[1], 'click');
    });
    it('Controlbar prev icon should be rendered when activeItem !== 1.', function() {
      //eslint-disable-next-line
      expect(!!q('.html5-player-prev-icon')).to.be.true;
    });
    it('It should work when switching to next video.', function(done) {
      //eslint-disable-next-line
      attributesChangeObserver(innerContainer.children[2], function() {
        //eslint-disable-next-line
        expect(
          !!~innerContainer.children[2].classList.value
            .split(' ')
            .indexOf('html5-player-carousel-item-active')
        ).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-next-icon').parentElement, 'click');
    });
    it('It should work when switching to prev video.', function(done) {
      //eslint-disable-next-line
      attributesChangeObserver(innerContainer.children[1], function() {
        //eslint-disable-next-line
        expect(
          !!~innerContainer.children[1].classList.value
            .split(' ')
            .indexOf('html5-player-carousel-item-active')
        ).to.be.true;
        done();
      });
      mockMouseEvent(q('.html5-player-prev-icon').parentElement, 'click');
    });
    it('Controlbar next icon should not be rendered when activeItem === 20.', function(done) {
      attributesChangeObserver(innerContainer.children[19], function() {
        //eslint-disable-next-line
        expect(
          !!~innerContainer.children[19].classList.value
            .split(' ')
            .indexOf('html5-player-carousel-item-active')
        ).to.be.true;
        //eslint-disable-next-line
        expect(!!q('.html5-player-next-icon')).to.be.false;
        resolve();
        done();
      });
      //点击列表中的第二个视频
      mockMouseEvent(innerContainer.children[19], 'click');
    });
  });
}
