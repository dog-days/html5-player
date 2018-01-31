'use strict';
console.log('Starting service...');

process.env.NODE_ENV = 'development';

const util = require('react-boilerplate-app-utils');
const scriptsPackagename = util.scriptsPackagename;
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const detect = require('detect-port');
const paths = require(util.pathResolve('config/paths.js', scriptsPackagename));
let proxy;
let proxyPath = util.pathResolve('config/proxy.js', scriptsPackagename);
if (proxyPath) {
  proxy = require(proxyPath);
}
let historyApiFallbackPath = util.pathResolve(
  'config/historyApiFallback.js',
  scriptsPackagename
);
let historyApiFallback;
if (historyApiFallbackPath) {
  historyApiFallback = require(historyApiFallbackPath);
}
const config = require(paths.webpackDevConfig);
const compiler = webpack(config);
const cwdPackageJsonConfig = util.getDefaultCwdPackageJsonConfig(
  scriptsPackagename
);
const host = cwdPackageJsonConfig.host;
//port 可以被修改，会被占用
let port = cwdPackageJsonConfig.port;
//经过转换后的historyApiFallback rewrites
if (
  cwdPackageJsonConfig.historyApiFallback &&
  cwdPackageJsonConfig.historyApiFallback.rewrites
) {
  let rewrites = util.historyApiFallbackRewiriteAdapter(
    cwdPackageJsonConfig.historyApiFallback.rewrites
  );
  cwdPackageJsonConfig.historyApiFallback.rewrites = rewrites;
}
const useYarn = util.shouldUseYarn();

function runDevServer(host, port) {
  let devServer = new WebpackDevServer(compiler, {
    /**
     * WebpackDevServer 提供的对外设置路由访问功能
     * create-react-boilerplate-app在这里提供了mock服务
     */
    before(app) {
      //begin----http mock处理
      const mockConfig = cwdPackageJsonConfig.mock;
      for (let k in mockConfig) {
        const mockTarget = mockConfig[k];
        util.mock(app, paths.appPublic, k, mockTarget);
      }
      //end----http mock处理
    },
    //开启HTML5 History API，所有请求都重定向到index.html（地址重写）
    historyApiFallback:
      historyApiFallback || cwdPackageJsonConfig.historyApiFallback || true,
    // 开启gzip功能
    compress: true,
    // 关闭WebpackDevServer繁琐的输出信息
    // 但警告和错误信息不会被关闭
    clientLogLevel: 'none',
    //静态文件
    contentBase: paths.appPublic,
    //开启热替换server
    hot: true,
    //跟webpack.config中publicPath相等，内存文件输出目录
    publicPath: config.output.publicPath,
    //会关闭WebpackDevServer编译后所有的信息（包括错误警告信息），后续通过compiler.plugin('done',null)自定义信息
    quiet: true,
    //watch设置
    watchOptions: {
      ignored: [/node_modules/, '**/*.swp', '**/*.swo', '**/*.xlsx'],
    },
    host: host || 'localhost',
    //packageJson中的proxy只能是字符串，无法使用函数
    proxy: proxy || cwdPackageJsonConfig.proxy || {},
  });
  //设置跨域访问，配合mock服务使用
  devServer.app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header(
      'Access-Control-Allow-Methods',
      'PUT,PATCH,POST,GET,DELETE,OPTIONS,HEAD'
    );
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });
  // 启动WebpackDevServer.

  let server = devServer.listen(port, err => {
    if (err) {
      return console.log(err);
    }
  });
  //begin----websocket mock服务
  if (cwdPackageJsonConfig.websocketMock) {
    let websocketMockConfig = cwdPackageJsonConfig.websocketMock;
    const socketIo = require('socket.io');
    const io = socketIo(server);
    io.on('error', function(err) {
      console.log(err);
    });
    io.on('connection', socket => {
      try {
        let mockObject, file;
        for (let k in websocketMockConfig.emit) {
          let v = websocketMockConfig.emit[k];
          file = path.join(paths.appPublic, v.url);
          if (!fs.existsSync(file)) {
            console.log();
            console.log(chalk.cyan(file));
            console.log(chalk.red('mock文件不存在！'));
            process.exit(1);
            console.log();
          }
          mockObject = require(file);
          v.type.forEach(t => {
            function getData() {
              if (
                Object.prototype.toString.apply(mockObject) !==
                '[object Function]'
              ) {
                console.log();
                console.log(chalk.red('mock的js文件必须返回函数！'));
                process.exit(1);
                console.log();
              }
              if (websocketMockConfig.log) {
                console.log();
                console.log('type: ', chalk.cyan('emit'));
                console.log('mock file path: ', chalk.cyan(file));
                console.log();
              }
              //传入type参数
              return mockObject(t) || {};
            }
            try {
              let data = getData();
              socket.emit(k, data);
            } catch (e) {
              console.log(e);
            }
          });
        }
        for (let j in websocketMockConfig.on) {
          let value = websocketMockConfig.on[j];
          file = path.join(paths.appPublic, value);
          if (!fs.existsSync(file)) {
            console.log();
            console.log(chalk.cyan(file));
            console.log(chalk.red('mock文件不存在！'));
            console.log();
            process.exit(1);
          }
          mockObject = require(file);
          socket.on(j, (data, callback) => {
            if (
              Object.prototype.toString.apply(mockObject) !==
              '[object Function]'
            ) {
              console.log();
              console.log(chalk.red('mock的js文件必须返回函数！'));
              console.log();
              process.exit(1);
            }
            let result = mockObject(data) || {};
            if (websocketMockConfig.log) {
              console.log();
              console.log('type: ', chalk.cyan('on'));
              console.log('mock file path: ', chalk.cyan(file));
              console.log('params: ', JSON.stringify(result, null, 2));
            }
            callback(result);
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
  //end----websocket mock服务
}

let isFirstCompile = true;
compiler.plugin('done', function(stats) {
  let messages = stats.toJson({}, true);
  let isError = messages.errors.length;
  if (!isError) {
    console.log(
      `Time: ${chalk.cyan((stats.endTime - stats.startTime) / 1000 + 's')}`
    );
    console.log();
  }

  if (!isError && isFirstCompile) {
    console.info(
      chalk.cyan(
        '==> 🌎  Listening on port %s. Open up http://' +
          host +
          ':%s/ in your browser.'
      ),
      port,
      port
    );
    console.log();
    let displayedCommand = 'npm run build';
    if (useYarn) {
      displayedCommand = 'yarn build';
    }
    console.log(
      'Production building,please use ' + chalk.cyan(displayedCommand) + '.'
    );
    console.log();
    isFirstCompile = false;
    openBrowser(`http://${host}:${port}`);
  }

  // 展示错误信息
  if (messages.errors.length) {
    console.log(chalk.red('faild to compile!'));
    console.log();
    messages.errors.forEach(message => {
      console.log(message);
      console.log();
    });
    return;
  }

  //展示警告信息
  if (messages.warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.'));
    console.log();
    messages.warnings.forEach(message => {
      console.log(message);
      console.log();
    });
  }
});
// "invalid" 是 "bundle invalidated" 缩写
// 不意味有错误
// 只要保存监控文件，就会触发重编译
// 重编译就是触发”invalid“事件
//compiler.plugin('invalid', () => {
//console.log('Compiling...');
//});

detect(port, (err, _port) => {
  if (err) {
    console.log(err);
  }
  if (port == _port) {
    runDevServer(host, port);
  } else {
    console.log(chalk.yellow(`port: ${port} was occupied, try port: ${_port}`));
    console.log();
    console.log(
      chalk.cyan(
        `It's recommended to add 'port: ${_port}' in package.json's field 'react-boilerplate-app-scripts'.`
      )
    );
    console.log();
    port = _port;
    runDevServer(host, _port);
  }
});
