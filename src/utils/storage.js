let storage;
const namespace = 'nan-player-';
try {
  storage = window.localStorage;
} catch (e) {
  /* ignore */
}

export function set(name, val) {
  storage.setItem(namespace + name, val);
}
export function get(name) {
  let val = storage.getItem(namespace + name);
  if (val === 'false' || val === 'true') {
    //处理boolean值
    val = JSON.parse(val);
  } else if (!isNaN(val) && val !== null && val !== undefined) {
    //处理数字
    val = parseInt(val, 10);
  }
  return val;
}
