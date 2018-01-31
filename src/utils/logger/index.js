import { DEBUG } from '../const';
export default function logger(type) {
  const originType = type;
  function noop() {}
  if (!DEBUG) {
    return noop;
  }
  if (!window.console) {
    return noop;
  }
  if (!window.console[type]) {
    if (window.console.log) {
      type = 'log';
    } else {
      return noop;
    }
  }
  function log(title, ...args) {
    const prevArg = [];
    if (
      Object.prototype.toString.apply(title) === '[object String]' ||
      Object.prototype.toString.apply(title) === '[object Number]'
    ) {
      const fontSize = 'font-size: 14px;';
      prevArg.push(`%c${title}%c`);
      if (originType === 'info') {
        prevArg.push(fontSize + 'font-weight: bold;color: #108ee9;');
      } else if (originType === 'success') {
        prevArg.push(fontSize + 'font-weight: bold;color: green;');
      } else {
        prevArg.push(fontSize + 'font-weight: bold');
      }
      prevArg.push('');
    } else {
      prevArg.push(title);
    }
    window.console[type](...prevArg, ...args);
  }
  return log;
}

export const log = logger('log');
export const success = logger('success');
export const info = logger('info');
export const error = logger('error');
export const warn = logger('warn');
