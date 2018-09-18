import API from './api';
import * as logger from '../utils/logger';

export default class html5API extends API {
  constructor(videoDOM, file) {
    let _this = super(videoDOM, file);
    return _this;
  }
  loadSource(file) {
    this.src = file;
    logger.info('Source Loading:', 'loading h5 video.');
  }
  detachMedia() {
    //必须设置src为空，浏览原生播放器才会断流，原生hls就有这种问题
    this.videoDOM.src = '';
  }
}
