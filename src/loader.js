import * as logger from './utils/logger';

export function chunkLoadErrorHandler(error, type = 'h5') {
  // Webpack require.ensure error: "Loading chunk 3 failed"
  logger.error('Module Loaded:', 'relative module loaded failed.');
  throw error;
}
//通过配置判断载入的文件
export default function selectBundle(config = {}) {
  let bundle;
  if (config.hlsjs) {
    bundle = loadHlsJsBundle(config);
  } else if (config.flvjs) {
    bundle = loadFlvJsBundle(config);
  } else {
    bundle = loadHtml5Bundle(config);
  }
  return bundle;
}

function loadFlvJsBundle(config) {
  return new Promise(function(resolve) {
    require.ensure(
      ['flv.ly.js/dist/flv.js', './api/flvjs-api'],
      function(require) {
        const flvjs = require('flv.ly.js/dist/flv.js');
        logger.success(
          'Module Loaded:',
          'relative flv.js module loaded sucessfully.'
        );
        const apiClass = require('./api/flvjs-api').default;
        apiClass.prototype.localization = config.localization;
        if (config.flvConfig && config.flvConfig.enableWorker) {
          //worker，多线程多线程转换流，减少延时（2秒左右）
          config.flvConfig = {
            ...config.flvConfig,
            ...{
              enableWorker: true,
              // lazyLoad: false,
              //Indicates how many seconds of data to be kept for lazyLoad.
              // lazyLoadMaxDuration: 0,
              // autoCleanupMaxBackwardDuration: 3,
              // autoCleanupMinBackwardDuration: 2,
              // autoCleanupSourceBuffer: true,
              enableStashBuffer: false,
              stashInitialSize: 128,
              isLive: true,
            },
          };
        }
        const api = new apiClass(
          config.videoDOM,
          config.file,
          flvjs,
          config.flvConfig
        );
        resolve({
          flvjs,
          api,
        });
      },
      chunkLoadErrorHandler,
      'provider.flvjs'
    );
  });
}

function loadHlsJsBundle(config) {
  return new Promise(function(resolve) {
    require.ensure(
      ['hls.js', './api/hlsjs-api', './model/video/events/hlsjs'],
      function(require) {
        const hlsjs = require('hls.js');
        logger.success(
          'Module Loaded:',
          'relative hls.js module loaded sucessfully.'
        );
        const apiClass = require('./api/hlsjs-api').default;
        apiClass.prototype.localization = config.localization;
        const api = new apiClass(config.videoDOM, config.file, hlsjs);
        const hlsjsEvents = require('./model/video/events/hlsjs').default;
        resolve({
          hlsjs,
          api,
          hlsjsEvents,
        });
      },
      chunkLoadErrorHandler,
      'provider.hlsjs'
    );
  });
}

function loadHtml5Bundle(config) {
  return new Promise(function(resolve) {
    const apiClass = require('./api/html5-api').default;
    apiClass.prototype.localization = config.localization;
    const api = new apiClass(config.videoDOM, config.file);
    resolve({
      api,
    });
  });
}
