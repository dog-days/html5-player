import API from './api';
import * as logger from '../utils/logger';

export default class flvAPI extends API {
  constructor(videoDOM, file, flvjs, flvConfig = {}) {
    let _this = super(videoDOM, file);
    this.flvConfig = flvConfig;
    if (flvjs.isSupported()) {
      flvjs.LoggingControl.enableDebug = false;
      flvjs.LoggingControl.enableVerbose = false;
      flvjs.LoggingControl.enableWarn = false;
      this.flvjs = flvjs;
    }
    return _this;
  }

  detachMedia() {
    const player = this.flvPlayer;
    if (player) {
      this.pause();
      player.unload();
      player.detachMediaElement();
      player.destroy();
      this.flvPlayer = null;
      logger.success('Detach Media:', 'detach media for flv.js sucessfully.');
    }
  }
  //首次运行
  first = true;
  //载入视频源，这里不可以用箭头函数
  loadSource(file) {
    const flvjs = this.flvjs;
    if (flvjs) {
      //如果已经有了实例化的播放器，先detach
      this.detachMedia();
      const flvPlayer = flvjs.createPlayer(
        {
          type: 'flv',
          url: file,
        },
        {
          ...this.flvConfig,
        }
      );
      this.flvPlayer = flvPlayer;
      flvPlayer.attachMediaElement(this);
      flvPlayer.load();
      logger.info('Source Loading :', 'loading flv video.');
      if (this.first) {
        this.first = false;
        this.attachEvent();
      }
    }
  }
  attachEvent() {
    const locale = this.localization;
    const errorTitle = 'Flv.js Error,';
    this.flvjs &&
      this.flvjs.LoggingControl.addLogListener((type, str) => {
        if (type === 'error') {
          let message;
          if (~str.indexOf('IOController')) {
            logger.error(errorTitle, `load error`);
            message = locale.fileCouldNotPlay;
            //一般trigger都是为了对外提供api，error是个比较特殊的情况，寄对外提供了事件，也对内提供了事件。
            //如果只是对内不对外的话，不可以使用trigger处理事件，所有的都用redux。
            this.event.trigger('error', {
              data: str,
              message,
              type,
            });
          }
        }
      });
  }
}
