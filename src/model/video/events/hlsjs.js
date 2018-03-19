import { namespace as videoNamespace } from '../../video';
import * as logger from '../../../utils/logger';

class HlsjsEvents {
  constructor(payload) {
    this.api = payload.api;
    this.dispatch = payload.dispatch;
    this.config = payload.config;
    if (!this.api.hlsObj) {
      logger.warn('No hls.js instantiation.');
      return;
    }
    this.loaded();
    logger.info('Listening:', 'listening on some hls.js events.');
  }
  loaded() {
    const api = this.api;
    api.hlsObj.on(api.Hls.Events.MANIFEST_LOADED, (event, data) => {
      this.setSubtitle();
      this.setQuality();
    });
  }
  setQuality() {
    const api = this.api;
    const dispatch = this.dispatch;
    const list = [];
    api.hlsObj.levels.forEach((v, k) => {
      list.push({
        label: `${v.height}p`,
        value: k,
      });
    });
    dispatch({
      type: `${videoNamespace}/pictureQualityList`,
      payload: {
        list,
      },
    });
  }
  setSubtitle() {
    const api = this.api;
    const dispatch = this.dispatch;
    // console.log(api.hlsObj.subtitleTracks);
    let clearIntervalObj;
    api.hlsObj.on(api.Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
      const currentTextTrack = api.textTracks[data.id];
      let cues = [];
      if (currentTextTrack) {
        //vtt没有加载时，切换是没信息的，所以首次切换字幕这里是不会触发dispatch
        cues = currentTextTrack.cues;
      }
      logger.info('Subtitle switched');
      dispatch({
        type: `${videoNamespace}/hlsSubtitleCues`,
        payload: cues,
      });
    });
    api.hlsObj.on(api.Hls.Events.SUBTITLE_TRACK_LOADED, (event, data) => {
      //首次切换字幕，加载字幕才会触发这个事件，第二次切换不会触发。
      const currentTextTrack = api.textTracks[api.currentSubtitleTrack];
      if (!currentTextTrack) {
        return;
      }
      //防止切换过快没清除。
      clearInterval(clearIntervalObj);
      let tempLength = 0;
      let k = 0;
      clearIntervalObj = setInterval(function() {
        const length = currentTextTrack.cues.length;
        if (currentTextTrack.cues.length > 0 && tempLength !== length) {
          tempLength = length;
          dispatch({
            type: `${videoNamespace}/hlsSubtitleCues`,
            payload: currentTextTrack.cues,
          });
        } else {
          //因为是异步的无法确定什么时候加载完字幕，字幕也可能分几个片段加载的。
          if (k >= 2) {
            logger.info('Subtitle switched');
            //如果两次以上length都没变化就判断为，加载完成。
            //这里不排除网络很差的导致加载字幕出问题，但是这种极端情况，不好处理，也没必要处理。
            //因为如果网络都差到连2KB的内容都加载不了，也完全播放不了视频了。
            clearInterval(clearIntervalObj);
          }
          k++;
        }
      }, 200);
    });
    dispatch({
      type: `${videoNamespace}/subtitleList`,
      payload: {
        subtitleList: api.hlsObj.subtitleTracks,
        subtitleId: -1,
      },
    });
  }
}

export default function(payload) {
  return new HlsjsEvents(payload);
}
