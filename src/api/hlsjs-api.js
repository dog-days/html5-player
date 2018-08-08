import API from './api';
import * as logger from '../utils/logger';
import {
  TIMEOUT_ERROR,
  LOAD_ERROR,
  CONTENT_PARSING_ERROR,
  UNKNOWN_ERROR,
  FATAL_ERROR,
} from '../utils/error-code';

export default class hlsAPI extends API {
  constructor(videoDOM, file, Hls) {
    let _this = super(videoDOM, file);
    this.file = file;
    if (Hls.isSupported()) {
      this.Hls = Hls;
      this.hlsObj = new Hls({
        liveDurationInfinity: true,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 25000,
        enableWorker: true,
      });
      //设置默认分辨率根据bandwidth自动选择
      this.hlsObj.startLevel = -1;
    }
    return _this;
  }
  //首次运行
  first = true;
  detachMedia() {
    const hls = this.hlsObj;
    if (hls) {
      hls.stopLoad();
      hls.destroy();
      logger.success('Detach Media:', 'detach media for hls.js sucessfully.');
    }
  }
  //载入视频源，这里不可以用箭头函数
  loadSource(file) {
    const Hls = this.Hls;
    if (Hls) {
      //如果已经有了实例化的播放器，先detach
      const hls = this.hlsObj;
      hls.detachMedia();
      hls.loadSource(file);
      hls.attachMedia(this.videoDOM);
      logger.info('Source Loading :', 'loading hls video.');
      if (this.first) {
        this.first = false;
        this.attachEvent();
      }
    }
  }
  attachEvent() {
    const hlsObj = this.hlsObj;
    const Hls = this.Hls;
    const locale = this.localization;
    if (!hlsObj) {
      return;
    }
    let message;
    let type;
    logger.info('Listening:', 'listening on hls.js events.');
    const errorTitle = 'Hls.js Error,';
    let beginDateStamp = 0;
    let endDateStamp = 0;
    let fragmentRequestTime = 0;
    hlsObj.on(Hls.Events.FRAG_LOADING, () => {
      beginDateStamp = +new Date();
    });
    hlsObj.on(Hls.Events.FRAG_LOADED, (event, data) => {
      endDateStamp = +new Date();
      fragmentRequestTime = endDateStamp - beginDateStamp;
      const info = {
        requestTime: fragmentRequestTime,
        duration: data.frag.duration,
        fileSize: data.frag.loaded,
        // file: this.file,
      };
      this.event.trigger('hlsFragmentInfo', info);
    });
    hlsObj.on(Hls.Events.ERROR, (event, data) => {
      switch (data.details) {
        case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
          message = locale.fileCouldNotPlay;
          logger.error(errorTitle, `cannot Load ${data.context.url}`);
          type = LOAD_ERROR;
          logger.error(
            errorTitle,
            `HTTP response code: ${data.response.code} ${data.response.text}`
          );
          if (data.response.code === 0) {
            message = locale.fileCouldNotPlay;
            logger.error(
              errorTitle,
              'this might be a CORS issue, consider installing https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi Allow-Control-Allow-Origin Chrome Extension'
            );
          }
          break;
        case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
          logger.error(errorTitle, 'timeout while loading manifest');
          message = locale.timeout;
          type = TIMEOUT_ERROR;
          break;
        case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
          logger.error(errorTitle, 'error while parsing manifest');
          message = locale.fileCouldNotPlay;
          type = CONTENT_PARSING_ERROR;
          break;
        case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
          logger.error(errorTitle, 'error while loading level playlist');
          message = locale.fileCouldNotPlay;
          type = LOAD_ERROR;
          break;
        case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          message = locale.timeout;
          type = TIMEOUT_ERROR;
          logger.error(errorTitle, 'level load timeout');
          break;
        case Hls.ErrorDetails.LEVEL_SWITCH_ERROR:
          logger.error(
            errorTitle,
            'error while trying to switch to level ' + data.level
          );
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          break;
        //case Hls.ErrorDetails.FRAG_LOAD_ERROR:
        //console.error('error while loading fragment ' + data.frag.url);
        //message = locale.unknownError;
        //type = UNKNOWN_ERROR;
        //break;
        case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
          logger.error(
            errorTitle,
            'timeout while loading fragment ' + data.frag.url
          );
          message = locale.timeout;
          type = TIMEOUT_ERROR;
          break;
        case Hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
          logger.error(errorTitle, 'Frag Loop Loading Error');
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          break;
        case Hls.ErrorDetails.FRAG_DECRYPT_ERROR:
          logger.error(errorTitle, 'Decrypting Error:' + data.reason);
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          break;
        case Hls.ErrorDetails.FRAG_PARSING_ERROR:
          logger.error(errorTitle, 'Parsing Error:' + data.reason);
          message = locale.fileCouldNotPlay;
          type = CONTENT_PARSING_ERROR;
          break;
        case Hls.ErrorDetails.KEY_LOAD_ERROR:
          logger.error(
            errorTitle,
            'error while loading key ' + data.frag.decryptdata.uri
          );
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          break;
        case Hls.ErrorDetails.KEY_LOAD_TIMEOUT:
          logger.error(
            errorTitle,
            'timeout while loading key ' + data.frag.decryptdata.uri
          );
          message = locale.timeout;
          type = TIMEOUT_ERROR;
          break;
        case Hls.ErrorDetails.BUFFER_APPEND_ERROR:
          logger.error(errorTitle, 'Buffer Append Error');
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          break;
        case Hls.ErrorDetails.BUFFER_ADD_CODEC_ERROR:
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          logger.error(
            errorTitle,
            'Buffer Add Codec Error for ' +
              data.mimeType +
              ':' +
              data.err.message
          );
          break;
        case Hls.ErrorDetails.BUFFER_APPENDING_ERROR:
          message = locale.unknownError;
          type = UNKNOWN_ERROR;
          logger.error(errorTitle, 'Buffer Append Error');
          break;
        //case 'fragLoadError':
        //message = locale.fileCouldNotPlay;
        //type = LOAD_ERROR;
        //console.error('fragLoadError Error');
        //break;
        default:
          break;
      }
      if (message) {
        //像buffer错误不用报错
        this.event.trigger('error', {
          //一般trigger都是为了对外提供api，error是个比较特殊的情况，寄对外提供了事件，也对内提供了事件。
          //如果只是对内不对外的话，不可以使用trigger处理事件，所有的都用redux。
          data,
          message,
          type,
        });
      }
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.MEDIA_ERROR:
            logger.error(errorTitle, 'media error:', data.details);
            break;
          case Hls.ErrorTypes.NETWORK_ERROR:
            logger.error(errorTitle, 'network error:', data.details);
            break;
          default:
            logger.error(errorTitle, 'fatal error:', data.details);
            message = locale.unknownError;
            type = FATAL_ERROR;
            this.event.trigger('error', {
              //一般trigger都是为了对外提供api，error是个比较特殊的情况，寄对外提供了事件，也对内提供了事件。
              //如果只是对内不对外的话，不可以使用trigger处理事件，所有的都用redux。
              data,
              message,
              type,
            });
            hlsObj.destroy();
            break;
        }
      }
    });
  }
}
