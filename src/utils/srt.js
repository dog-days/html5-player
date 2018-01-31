import { seconds, trim } from './util';

// Component that loads and parses an SRT file

export default function Srt(data) {
  // Trim whitespace and split the list by returns.
  var _captions = [];
  data = trim(data);
  var list = data.split('\r\n\r\n');
  if (list.length === 1) {
    list = data.split('\n\n');
  }

  for (var i = 0; i < list.length; i++) {
    if (list[i] === 'WEBVTT') {
      continue;
    }
    // Parse each entry
    var entry = _entry(list[i]);
    _captions.push(entry);
  }

  return _captions;
}

/** Parse a single captions entry. **/
function _entry(data) {
  var entry = {};
  var array = data.split('\r\n');
  if (array.length === 1) {
    array = data.split('\n');
  }
  var idx = 1;
  if (array[0].indexOf(' --> ') > 0) {
    idx = 0;
  }
  if (array.length >= idx + 1) {
    // This line contains the start and end.
    var line = array[idx];
    var index = line.indexOf(' --> ');
    if (index > 0) {
      if(/^\d{4}-\d{2}-\d{2}\s.*/.test(line)) {
        //处理history的日期
        entry.begin = +new Date(line.substr(0, index)) / 1000;
        entry.end = +new Date(line.substr(index + 5)) / 1000;
      }else {
        entry.begin = seconds(line.substr(0, index));
        entry.end = seconds(line.substr(index + 5));
      }
      // Remaining lines contain the text
      entry.text = array.slice(idx + 1).join('\r\n');
    }
  }
  return entry;
}
