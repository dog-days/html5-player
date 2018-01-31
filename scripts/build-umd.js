'use strict';
console.log();
console.log('Building...');
console.log('This might take a couple minutes.');
console.log();

process.env.NODE_ENV = 'production';

const util = require('react-boilerplate-app-utils');
const scriptsPackagename = util.scriptsPackagename;
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const paths = require(util.pathResolve('config/paths.js', scriptsPackagename));
const webpack = require('webpack');
const config = require('../config/webpack.config.umd');
const Table = require('cli-table');
const gzipSize = require('gzip-size').sync;

const topBuildFolder = paths.umdBuild;
//清空build文件夹
fs.emptyDirSync(topBuildFolder);

webpack(config).run(function(err, stats) {
  if (err) {
    console.log(chalk.red('Failed to build.'));
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();
  if (stats.hasErrors()) {
    util.printValidationResults(info.errors, 'error');
  }

  if (stats.hasWarnings()) {
    util.printValidationResults(info.warnings, 'warning');
  }
  if (info.assets && info.assets[0]) {
    fs.copySync(
      path.resolve(paths.appPublic, 'umd.html'),
      path.resolve(topBuildFolder, 'index.html')
    );
    //处理header
    var head = ['Asset', 'Real Size', 'Gzip Size', 'Chunks', '', 'Chunk Names'];
    head = head.reduce((a, b) => {
      a.push(chalk.cyan(b));
      return a;
    }, []);
    var table = new Table({
      head,
    });
    info.assets.forEach(v => {
      var sizeAfterGzip;
      if (v.name.match(/(.js$)|(.css$)/)) {
        var fileContents = fs.readFileSync(
          path.resolve(topBuildFolder, v.name)
        );
        sizeAfterGzip = gzipSize(fileContents);
      }
      table.push([
        chalk.green(v.name),
        util.transformToKBMBGB(v.size, { decimals: 2 }),
        sizeAfterGzip
          ? util.transformToKBMBGB(sizeAfterGzip, { decimals: 2 })
          : '',
        v.chunks,
        v.emitted ? chalk.green('[emitted]') : '',
        v.chunkNames,
      ]);
    });
    console.log(`Hash: ${chalk.cyan(info.hash)}`);
    console.log(`Version: ${chalk.cyan(info.version)}`);
    console.log(`Time: ${chalk.cyan(info.time / 1000 + 's')}`);
    console.log();
    console.log(table.toString());
    console.log();
    const useYarn = util.shouldUseYarn();
    console.log(`The ${chalk.cyan('build')} folder: `);
    console.log(chalk.cyan(topBuildFolder));
    console.log('is ready to be served.');
    console.log('You may serve it with a static server:');
    console.log();
    var displayedCommand = 'npm run';
    if (useYarn) {
      displayedCommand = 'yarn';
    }
    console.log(chalk.cyan(` ${displayedCommand} serve-umd-build`));
  }
});
