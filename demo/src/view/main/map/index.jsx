import React from 'react';
import ReactDOM from 'react-dom';
import Html5Player from 'html5-player';

import addEventListener from '../../../../../src/utils/dom/addEventListener';

const AMap = window.AMap;
const AMapUI = window.AMapUI;

export default class View extends React.Component {
  componentDidMount() {
    const _this = this;
    //创建地图
    var map = new AMap.Map('demo-container', {
      zoom: 4,
    });

    AMapUI.loadUI(['overlay/SimpleInfoWindow'], SimpleInfoWindow => {
      var marker = new AMap.Marker({
        map: map,
        zIndex: 9999999,
        position: map.getCenter(),
      });

      var infoWindow = new SimpleInfoWindow({
        infoTitle: '<strong>这里是标题</strong>',
        infoBody: '<div id="amap-container" style="width: 300px;"></div>',

        //基点指向marker的头部位置
        offset: new AMap.Pixel(0, -31),
      });
      let closeEvent;
      function openInfoWin() {
        infoWindow.open(map, marker.getPosition());
        if (closeEvent && closeEvent.remove) {
          closeEvent.remove();
        }
        closeEvent = addEventListener(
          infoWindow
            .get$Container()[0]
            .querySelector('.amap-ui-infowindow-close'),
          'click',
          () => {
            ReactDOM.render(
              <span />,
              document.getElementById('amap-container')
            );
            closeEvent.remove();
          }
        );
      }

      //marker 点击时打开
      AMap.event.addListener(marker, 'click', () => {
        openInfoWin();
        ReactDOM.render(
          this.renderPlayer(),
          document.getElementById('amap-container')
        );
      });
      openInfoWin();
      setTimeout(function() {
        ReactDOM.render(
          _this.renderPlayer(),
          document.getElementById('amap-container')
        );
      }, 200);
    });
  }
  renderPlayer() {
    return (
      <Html5Player
        file="https://dog-days.github.io/demo/static/react.mp4"
        tracks={[
          {
            kind: 'subtitle',
            file: `${process.env.basename}/subtitle-zh-cn.vtt`,
            label: '中文',
          },
          {
            kind: 'subtitle',
            file: `${process.env.basename}/subtitle-en.vtt`,
            label: 'English',
          },
        ]}
      />
    );
  }
  render() {
    return (
      <div id="demo-container" style={{ width: '100%', height: '500px' }} />
    );
  }
}
