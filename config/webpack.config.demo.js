const util = require('react-boilerplate-app-utils');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
const useSass = getInfo('sass-loader') && getInfo('node-sass');
const useLess = getInfo('less') && getInfo('less-loader');
//end  -----------packageJson信息获取
const cwdPackageJsonConfig = util.getDefaultCwdPackageJsonConfig(
  scriptsPackagename
);
const postcssLoaderConfig = {
  loader: 'postcss-loader',
  options: {
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

let entry = [
  require.resolve(util.pathResolve('config/polyfills.js', scriptsPackagename)),
  paths.appEntry,
];
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
  devtool: false,
  //隐藏终端的warning信息
  performance: {
    hints: false,
    maxEntrypointSize: 1100000,
    maxAssetSize: 505000,
  },
  entry: {
    app: entry,
  },
  output: {
    filename: 'bundle.[hash].js',
    //js打包输出目录
    path: paths.appBuild,
    //内存和打包静态文件访问目录，以index.html为准,最好以斜杠/结尾，要不有意想不到的bug
    //因为有些网站访问web app不是在根目录，可能是根目录中的的文件夹，basename是用来设置这种情况的
    //例如`/demo`，访问网站根目录demo文件中的web app
    publicPath: `${cwdPackageJsonConfig.basename}/` || '/',
    //定义require.ensure文件名
    chunkFilename: '[name]-[hash].js',
    libraryTarget: 'var',
  },
  module: {
    rules: [
      //匹配到rquire中以.css结尾的文件则直接使用指定loader
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', postcssLoaderConfig],
        }),
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
        ],
        loader: 'file-loader',
        options: {
          name: 'media/[hash:8].[ext]',
        },
      },
      //limit是base64转换最大限制，小于设置值，都会转为base64格式
      //name是在css中提取图片的命名方式
      //目前设置.bmp、.git、.jpe(g)、.png、.svg、.webp转换
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg/, /\.webp$/],
        //[path]是以publicPath为准
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[hash].[ext]',
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
      src: paths.src,
      // react: 'preact-compat',
      // 'react-dom': 'preact-compat',
      'html5-player/libs/playlist': path.resolve(process.cwd(), 'src/playlist'),
      'html5-player/libs/history': path.resolve(process.cwd(), 'src/history'),
      'html5-player': path.resolve(process.cwd(), 'src'),
    },
    //不可留空字符串
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.web.js', '.web.jsx'],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      basename: cwdPackageJsonConfig.basename,
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
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
    new ExtractTextPlugin({
      filename: 'css/styles.[hash].css',
      //最好true,要不后面加上sass-loader等时，会出现css没有提取的现象
      allChunks: true,
    }),
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
//使用sass配置
if (useSass) {
  config.module.rules.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', postcssLoaderConfig, 'sass-loader'],
    }),
  });
}
//使用sass配置
if (useLess) {
  config.module.rules.push({
    test: /\.less$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', postcssLoaderConfig, 'less-loader'],
    }),
  });
}

module.exports = config;
