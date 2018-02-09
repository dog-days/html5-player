'use strict';

const util = require('react-boilerplate-app-utils');
const scriptsPackagename = util.scriptsPackagename;
const path = require('path');
const cwdPackageJsonConfig = util.getDefaultCwdPackageJsonConfig(
  scriptsPackagename
);

function pathResolve(relativePath) {
  return util.pathResolve(relativePath, scriptsPackagename);
}
//pathResolve使用相对路径，不要使用绝对路径
var paths = {
  webpackDevConfig: pathResolve('config/webpack.config.dev.js'),
  webpackProdConfig: pathResolve('config/webpack.config.prod.js'),
  webpackDllConfig: pathResolve('config/webpack.config.dll.js'),
  //app 程序入口js文件
  appEntry: pathResolve(cwdPackageJsonConfig.appEntryPath),
  //dev server静态资源访问目录
  appPublic: pathResolve(cwdPackageJsonConfig.appPublicPath),
  //app 入口html文件
  appHtml: path.resolve(
    process.cwd(),
    cwdPackageJsonConfig.appPublicPath,
    cwdPackageJsonConfig.index
  ),
  //程序打包目录，根据prefixURL变化
  appBuild: path.join(
    process.cwd(),
    'demo/build',
    cwdPackageJsonConfig.basename
  ),
  umdBuild: path.resolve(process.cwd(), 'dist'),
  //app 程序目录
  src: path.resolve(cwdPackageJsonConfig.appSrcPath),
};

module.exports = paths;
