const util = require('react-boilerplate-app-utils');
const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
const autoprefixer = require('autoprefixer');
const chalk = require('chalk');
const scriptsPackagename = util.scriptsPackagename;
const paths = require(util.pathResolve('config/paths.js', scriptsPackagename));

//bebin-----------packageJson信息获取
const packageJson = util.getCwdPackageJson();
function getInfo(packageId) {
  return !!(
    (packageJson.dependencies && packageJson.dependencies[packageId]) ||
    (packageJson.devDependencies && packageJson.devDependencies[packageId])
  );
}
const useLess = getInfo('less') && getInfo('less-loader');
//end  -----------packageJson信息获取
const cwdPackageJsonConfig = util.getDefaultCwdPackageJsonConfig(
  scriptsPackagename
);
const postcssLoaderConfig = {
  loader: 'postcss-loader',
  options: {
    sourceMap: false,
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          // React doesn't support IE8 anyway
          'not ie < 9',
        ],
      }),
    ],
  },
};

const exclude = [
  /node_modules/,
  path.resolve(process.cwd(), 'config'),
  path.resolve(process.cwd(), 'bin'),
  path.resolve(process.cwd(), 'build'),
  /.cache/,
];
//webpack配置项
var config = {
  //任何错误立即终止
  bail: true,
  devtool: 'source-map',
  //隐藏终端的warning信息
  performance: {
    hints: false,
    maxEntrypointSize: 1100000,
    maxAssetSize: 505000,
  },
  entry: {
    html5Player: [
      require.resolve(
        util.pathResolve('config/polyfills.js', scriptsPackagename)
      ),
      path.resolve(process.cwd(), 'src/umd.jsx'),
    ],
  },
  output: {
    //内存和打包静态文件访问目录，以index.html为准,最好以斜杠/结尾，要不有意想不到的bug
    //因为有些网站访问web app不是在根目录，可能是根目录中的的文件夹，basename是用来设置这种情况的
    //例如`/demo`，访问网站根目录demo文件中的web app
    publicPath: `${cwdPackageJsonConfig.basename}/` || '/',
    path: paths.umdBuild,
    filename: '[name].js',
    chunkFilename: '[name].[hash].js',
    sourceMapFilename: '[name].[hash].map',
    library: 'html5Player',
    libraryExport: 'default',
    libraryTarget: 'window',
    pathinfo: true,
    umdNamedDefine: true,
  },
  module: {
    rules: [
      //匹配到rquire中以.css结尾的文件则直接使用指定loader
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', postcssLoaderConfig],
      },
      //字体等要经过file-loader提取到指定目录
      {
        //特别留意这里，如果有新的loader后缀名，都会优先经过这里
        //需要在这里过滤调，如.less，.scss
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(ts|tsx)$/,
          /\.css$/,
          /\.less$/,
          /\.scss/,
          /\.json$/,
          /\.bmp$/,
          /\.gif$/,
          /\.jpe?g$/,
          /\.png$/,
          /\.svg$/,
          /\.webp$/,
          /\.eot$/,
          /\.ttf/,
        ],
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      //limit是base64转换最大限制，小于设置值，都会转为base64格式
      //name是在css中提取图片的命名方式
      //目前设置.bmp、.git、.jpe(g)、.png、.svg、.webp转换
      {
        test: [
          /\.bmp$/,
          /\.gif$/,
          /\.jpe?g$/,
          /\.png$/,
          /\.svg/,
          /\.webp$/,
          /\.eot$/,
          /\.ttf/,
        ],
        //[path]是以publicPath为准
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash].[ext]',
        },
      },
      {
        //确保在babel转换前执行
        enforce: 'pre',
        test: /\.js[x]?$/,
        //之所以不用include是因为，如果单独是用react-boilerplate-app-scirpts，
        //修改了paths.src的路径，但是还是想检查其他的目录，这就会有问题。
        exclude,
        loader: 'eslint-loader',
      },
      {
        //匹配.js或.jsx后缀名的文件
        test: /\.js[x]?$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
        //之所以不用include是因为，如果单独是用react-boilerplate-app-scirpts，
        //修改了paths.src的路径，但是还是想检查其他的目录，这就会有问题。
        exclude,
      },
    ],
  },
  externals: {},
  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
    //不可留空字符串
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.web.js', '.web.jsx'],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.basename': JSON.stringify(cwdPackageJsonConfig.basename),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.NANPLAERVERSION': JSON.stringify(packageJson.version),
    }),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({
      // optionally pass test, include and exclude, default affects all loaders
      test: /\.css|.js|.jsx|.scss$/,
      minimize: true,
      debug: false,
    }),
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      sourceMap: true,
      uglifyJS: {
        output: {
          comments: false,
        },
        compress: {
          warnings: false,
        },
      },
    }),
    //new ExtractTextPlugin({
    //filename: 'static/css/styles.[hash].css',
    //最好true,要不后面加上sass-loader等时，会出现css没有提取的现象
    //allChunks: true,
    //}),
    new SimpleProgressPlugin({
      progressOptions: {
        complete: chalk.bgGreen(' '),
        incomplete: chalk.bgWhite(' '),
        width: 20,
        total: 100,
        clear: true,
      },
    }),
    new CaseSensitivePathsPlugin(),
  ],
};

//使用less配置
if (useLess) {
  config.module.rules.push({
    test: /\.less$/,
    use: [
      'style-loader',
      'css-loader',
      postcssLoaderConfig,
      {
        loader: 'less-loader',
        options: {
          sourceMap: false,
        },
      },
    ],
  });
}
module.exports = config;
