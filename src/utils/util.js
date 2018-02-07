import React from 'react';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';

import videoUtil from './video';
/**
 *  标准reducer处理，根据payload进行处理。
 *  action的格式{
 *    type: '',
 *    payload: {}
 *  }
 */
export function standardReducer(state, { payload }) {
  return {
    ...state,
    ...payload,
  };
}
//根据.m3u判断
export function isM3u8File(file = '') {
  return !!~file.indexOf('.m3u');
}
//是否应该使用hls.js
export function shouldUseHlsjs(file, forceOpenHls = false) {
  let hlsjs = false;
  if (
    forceOpenHls ||
    (isM3u8File(file) &&
      !videoUtil.canPlayType('application/vnd.apple.mpegurl'))
  ) {
    hlsjs = true;
  }
  return hlsjs;
}
//根据.m3u判断
export function isFlvFile(file = '') {
  return !!~file.indexOf('.flv');
}
//是否应该使用flv.js
export function shouldUseFlvjs(file) {
  let flvjs = false;
  if (isFlvFile(file) && !videoUtil.canPlayType('video/x-flv')) {
    flvjs = true;
  }
  return flvjs;
}
//当前浏览器视频支持视频播放
export function isH5VideoSupported(file) {
  const suffix = file.match(/.*\.(.*)$/)[1];
  if (!suffix) {
    console.warn(`当前浏览器不支持此视频格式。`);
    return true;
  }
  //以下视频容器格式都是chrome支持的
  const container = {
    mp4: 'video/mp4',
    f4v: 'video/mp4',
    m4v: 'video/mp4',
    mov: 'video/mp4',
    ogv: 'video/ogg',
    ogg: 'video/ogg',
    oga: 'video/ogg',
    vorbis: 'video/ogg',
    webm: 'video/webm',
  };
  return !!videoUtil.canPlayType(container[suffix]);
}
//是否是手机触摸事件
export function isNotTouchEvent(e) {
  return (
    e.touches.length > 1 ||
    (e.type.toLowerCase() === 'touchend' && e.touches.length > 0)
  );
}

export function trim(inputString) {
  return inputString.replace(/^\s+|\s+$/g, '');
}
//秒转时间格式，根据时间自动判段（mm:ss || HH:mm:ss）
export function hms(secondsNumber) {
  let h = Math.floor(secondsNumber / 3600);
  let m = Math.floor(secondsNumber / 60) % 60;
  let s = secondsNumber % 60;
  if (isNaN(h) || isNaN(m) || isNaN(s)) {
    h = 0;
    m = 0;
    s = 0;
  }
  if (h === 0) {
    return pad(m, 2) + ':' + pad(s.toFixed(0), 2);
  }
  return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s.toFixed(0), 2);
}
//根据提供的长度和字符串长度，向右填充指定字符
export function pad(str, length, padder) {
  str = '' + str;
  padder = padder || '0';
  while (str.length < length) {
    str = padder + str;
  }
  return str;
}

// Convert a time-representing string to a number
export function seconds(str, frameRate) {
  if (!str) {
    return 0;
  }
  if (isNumber(str) && !isNaN(str)) {
    return str;
  }

  str = str.replace(',', '.');
  var arr = str.split(':');
  var arrLength = arr.length;
  var sec = 0;
  if (str.slice(-1) === 's') {
    sec = parseFloat(str);
  } else if (str.slice(-1) === 'm') {
    sec = parseFloat(str) * 60;
  } else if (str.slice(-1) === 'h') {
    sec = parseFloat(str) * 3600;
  } else if (arrLength > 1) {
    var secIndex = arrLength - 1;
    if (arrLength === 4) {
      // if frame is included in the string, calculate seconds by dividing by frameRate
      if (frameRate) {
        sec = parseFloat(arr[secIndex]) / frameRate;
      }
      secIndex -= 1;
    }
    sec += parseFloat(arr[secIndex]);
    sec += parseFloat(arr[secIndex - 1]) * 60;
    if (arrLength >= 3) {
      sec += parseFloat(arr[secIndex - 2]) * 3600;
    }
  } else {
    sec = parseFloat(str);
  }
  if (isNaN(sec)) {
    return 0;
  }
  return sec;
}

/**
 * params json对象(一级)拼接url ?后面的参数
 * @param  {String} url  需要拼接的url
 * @param  {Objct}  params 需要拼接的url json参数
 * @return {String}    拼接的url
 */
export function joinUrlParams(url, params) {
  let p = '';
  let i = 0;
  for (var key in params) {
    let value = params[key];
    if (i === 0 && !~url.indexOf('?')) {
      p += '?' + key + '=' + value;
    } else {
      p += '&' + key + '=' + value;
    }
    i++;
  }
  //random防止IE可能出现的缓存问题
  if (key) {
    p += '&random=' + randomKey();
  } else {
    if (~url.indexOf('?')) {
      p += '&random=' + randomKey();
    } else {
      p += '?random=' + randomKey();
    }
  }
  return url + p;
}

export function delay(ms) {
  if (isNaN(ms)) {
    console.error('请输入正确的毫秒！');
    return;
  }

  let timeoutId = 0;
  const promise = new Promise(function(resolve) {
    timeoutId = setTimeout(function() {
      return resolve(true);
    }, ms);
  });
  promise.clearTimeout = function() {
    clearTimeout(timeoutId);
  };
  return promise;
}

export function randomKey() {
  return Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('');
}

export function getChildProps(children) {
  //preact生成环境下children只有一个也变成数组;
  let childProps = (children[0] || children).attributes;
  if (!childProps) {
    childProps = (children[0] || children).props;
  }
  return childProps;
}
//原生html标签才生效
export function getChildName(children) {
  //preact生成环境下children只有一个也变成数组;
  let childName = (children[0] || children).nodeName;
  if (!childName) {
    childName = (children[0] || children).type;
  }
  return childName;
}
/**
 * clone单个的chidren，多个的暂不支持。
 */
export function cloneElement(element, props, children) {
  const elementProps = getChildProps(element);
  return React.createElement(
    getChildName(element),
    {
      ...elementProps,
      ...props,
    },
    [elementProps.children, children]
  );
}

/**
 *  日期格式转换
 *@param {String||Int} time 时间戳（毫秒级）或 其他的日期的各种格式
 *@param { String } fmt 格式如 YYYY-MM-DD HH:mm:ss.S ==> 2016-07-02 08:09:04.423,可自定义
 *@return 返回自定义的时间格式
 */
export function dateFormat(time, fmt) {
  var date = new Date(time);
  var o = {
    'M+': date.getMonth() + 1, //月份
    'D+': date.getDate(), //日
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(Y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
  return fmt;
}
