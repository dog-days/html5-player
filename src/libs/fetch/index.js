import axios from 'axios';
import requestConfig from './config.js';
import isObject from 'lodash/isObject';

/**
 * 处理axios的异常问题，只要能接收到接口数据，都当做是成功请求。
 * 中途出错，无法返回的数据才传递可捕获的异常。
 * @param {error} error
 * @param {object} statusCallback
 * @param {array} filterStatusMap 过滤status
 */
function catchError(error, statusCallback, filterStatusMap) {
  if (error.response && error.response.data) {
    //只有返回json数据的才会走这里，校正为非异常，属于正常后端返回。
    let status = error.response.status;
    if (filterStatusMap && ~filterStatusMap.indexOf(status)) {
      status = null;
    }
    statusCallback && statusCallback(status, error.response.data);
    //传递http返回码到后端接口返回的数据结构中，通过'__'前缀来区分
    if (isObject(error.response.data)) {
      error.response.data.__status__ = error.response.status;
      //传递接口是否是正常状态到后端接口返回的数据结构中，通过'__'前缀来区分
      //这里返回的都是后端接口不正常的数据，后端接口除了200其他都是异常
      error.response.data.__error__ = true;
    }
    return error.response.data;
  } else if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    //console.error(error.response);
    throw error;
  } else if (error.request) {
    //请求超时
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    //console.error(error.message, error.request);
    throw error;
  } else {
    // Something happened in setting up the request that triggered an Error
    //console.log(error.message);
    throw error;
  }
}

/**
 *@param { object } config 跟axios一样，同时自定义了一个filterStatusMap
 *      config.filterStatusMap 如果想在当前请求不走统一处理提示，可以设置filterStatusMap
 *@param { function } statusCallback 状态回调（只要是返回正常的json数据，就会走这里）。
 *    主要提供后续自定义统一返回码提示。
 *    function(status,data){}，status是http状态码，data是后端接口返回的数据（可用是text、json、document等，看设置）
 *@param { function } catchErrorCallback   自定义的异常提示信息，跨域问题、服务器500等非正常返回提示。
 */
export class Fetch {
  constructor(config, statusCallback, catchErrorCallback) {
    this.config = config;
    this.statusCallback = statusCallback;
    this.catchErrorCallback = catchErrorCallback;
  }

  setHeaders(callback) {
    this.headersFunc = callback;
  }

  //在使用axios时调用，不要再constructor使用
  getHeaders() {
    return this.headersFunc && this.headersFunc();
  }
  getCancelSource() {
    var CancelToken = axios.CancelToken;
    var source = CancelToken.source();
    return source;
  }
  request(config) {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    if (!config.headers) {
      config.headers = {};
    }
    const headers = this.getHeaders();
    config.headers = {
      ...this.config.headers,
      ...headers,
      ...config.headers,
    };
    config = {
      ...this.config,
      ...config,
    };

    config.url = joinUrlParams(config.url, {});
    return axios
      .request(config)
      .then(response => {
        this.statusCallback &&
          this.statusCallback(response.status, response.data);
        if (response.data) {
          if (isObject(response.data)) {
            response.data.__status__ = response.status;
          }
        } else {
          throw new Error('正常返回200的数据格式跟设置的responseType不一致！');
        }
        return response.data;
      })
      .catch(error => {
        //catchError做了一些自定义错误（删除了一些）
        return catchError(error, this.statusCallback);
      })
      .catch(error => {
        //如果想在当前请求不走统一处理提示，可以设置filterStatusMap
        this.catchErrorCallback &&
          this.catchErrorCallback(error, config.filterStatusMap);
        throw error;
      });
  }
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
    p += '&random=' + Math.random() * 100100;
  } else {
    if (~url.indexOf('?')) {
      p += '&random=' + Math.random() * 100100;
    } else {
      p += '?random=' + Math.random() * 100100;
    }
  }
  return url + p;
}
/**
 * 参数参考 Fetch
 * @param { function } setHeaders 返回headers设置
 */
export default function(
  config,
  statusCallback,
  catchErrorCallback,
  setHeaders,
  //防止IE缓存，添加随机数
  ieCache = true
) {
  config = {
    ...requestConfig,
    ...config,
  };
  let fetch = new Fetch(config, statusCallback, catchErrorCallback);
  fetch.setHeaders(setHeaders);
  //这里向外提供get、delete等直接使用的方式。
  var methods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'];
  methods.forEach(v => {
    switch (v) {
      case 'post':
      case 'put':
      case 'patch':
        fetch[v] = function(url, data, config) {
          return fetch.request({
            method: v,
            data,
            url,
            ...config,
          });
        };
        break;
      default:
        fetch[v] = function(url, config) {
          return fetch.request({
            method: v,
            url,
            ...config,
          });
        };
    }
  });
  return fetch;
}
