'use strict';

const fs = require('fs-extra');
const path = require('path');
const version = require('../package.json').version;
//向src/verison.js写入version信息。
fs.writeFileSync(
  path.resolve(process.cwd(), 'src/version.js'),
  `window.html5PlayerVersion = '${version}';`
);
