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
  detachMedia() {}
}
