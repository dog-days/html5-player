# Html5 Player

[![build status](https://travis-ci.org/dog-days/html5-player.svg?branch=master)](https://travis-ci.org/dog-days/html5-player) [![codecov](https://codecov.io/gh/dog-days/html5-player/branch/master/graph/badge.svg)](https://codecov.io/gh/dog-days/html5-player) [![npm package](https://badge.fury.io/js/html5-player.svg)](https://www.npmjs.org/package/html5-player) [![NPM downloads](http://img.shields.io/npm/dm/html5-player.svg)](https://npmjs.org/package/html5-player)

本视频播放器使用了 react、redux、redux-saga 实现了支持原生 H5 Video 的所有格式，同时添加了对 HLS 和 FLV 的支持。为了减轻打包 js 文件，兼容了 preact 替换 react。

> **不使用 react 的项目一样可以使用 html5-player，不过打包后的代码包含了 react 相关代码，如果使用 jsx 语法，那么用法大部分基本一致。当然建议使用 react 更好，如果使用 react、redux、redux-saga，除开这些依赖代码，html5-player 的代码，包括图片样式，gzip 后在 30KB 以内。**

> umd功能暂时不做处理了，没怎么用到。

## 功能

* 原生 H5 支持的视频源播放
* HLS 视频播放
* FLV 视频播放
* 字幕功能（自定义和hls自带字幕）
* 缩略图预览
* 播放速度
* 视频画质（清晰度，目前只支持hls.js的清晰度）
* 视频断片功能（这个是个额外功能，包括fragment和history的）
* 播放列表功能

## 兼容性

兼容 IE10 以上，Edge、谷歌、火狐、Opera、Safari 等主流浏览器。但是由于需要支持 HLS 和 FLV，HLS 只兼容了 IE11。FLV 也是只兼容了到 IE11 和 Sarari 10 版本以上（但是目前IE11播放一些直播也不行，safari播放一些直播经常不断返回结束事件）。

> 不支持音频文件的 UI，目前本项目只处理了视频 UI。

> 目前只支持 PC 端，暂不支持移动端。

**由于 flv 直播状态兼容性问题，需要通过设置 isLiving=true 来强制设置为直播状态。**

## 入门使用

### 安装

首先安装`html5-player`

```sh
npm i html5-player -S
```

### 启动demo

clone 本项目，运行下面的命令

```sh
npm install
npm start
#npm run start 可以查看开发环境demo
#npm run build-demo可以构建项目demo
#npm run serve-demo-build 可以启动服务查看项目demo
```

### 使用

在 react 中的使用，react 版本要求是 v15.x 以上，还需要引入样式：

```js
import 'html5-player/libs/assets/css/style.css';
```

```jsx
import React from 'react';
import Html5Player from 'html5-player';
class View extends React.Component {
  render() {
    return (
      <Html5Player
        title="这里是标题"
        file="/test.mp4"
        //logo支持string，React Element和plainObject
        logo={{
          image: '/logo.png',
          link: 'https://github.com/dog-days/html5-player',
        }}
        videoCallback={palyer => {
          //player参数是实例化后的播放器，详情请看后续API
        }}
      />
    );
  }
}
```

**如果使用 flv 直播，需要设置 enableWorker，可以减少延时到 1 秒左右。 但是如果不是直播，不可以设置，否则会报错。**

```jsx
<Html5Player
  flvConfig={{ enableWorker: true }}
  title="这里是标题"
  file="/test.mp4"
  //logo支持string，React Element和plainObject
  logo={{
    image: '/logo.png',
    link: 'https://github.com/dog-days/html5-player',
  }}
/>
```

## API

### 播放器 props 参数

```jsx
//react jsx用法
<Html5Player {...props} />
//umd用法 html5Player(props)
//历史视频使用方式
<HistoryPlayer {...props} />
```

参数如下：

| props                    | 类型                                  | 说明                                                         | 默认值                  | 必填 |
| :----------------------- | :------------------------------------ | :----------------------------------------------------------- | :---------------------- | :--- |
| file                     | string                                | 视频文件路径                                                 | 无                      | 是   |
| forceOpenHls，           | boolean                               | 强制使用hls.js，safari也会使用                               | 无                      | 否   |
| isLiving                 | boolean                               | 强制设置为直播状态。safari 中 flv 无法获取直播状态，所以需要设置这个。 | false                   | 否   |
| livingMaxBuffer          | float                                 | 直播最大缓存时间（秒），如果卡设置大一定的值，理论上是越小延时越小。(hls 需要而外加上 15 秒) | 2                       | 否   |
| height                   | string <br />number                   | 播放器高度，不设置高度时，父元素的高度需要设置。             | 100%                    | 否   |
| width                    | string <br />number                   | 播放器宽度                                                   | 100%                    | 否   |
| title                    | string<br />React.element             | 标题                                                         | 无                      | 否   |
| logo                     | string<br />React.element<br />object | logo                                                         | 无                      | 否   |
| poster                   | string                                | video 的 poster，海报图                                      | 无                      | 否   |
| stretching               | string                                | 调整视频大小以适合播放器尺寸。                               | uniform                 | 否   |
| aspectratio              | string                                | 播放器纵横比，<br />只有设置了 width 才有效<br />，格式为`x:y` | 16:9                    | 否   |
| muted                    | boolean                               | 是否静音                                                     | false                   | 否   |
| loop                     | boolean                               | 是否循环播放                                                 | false                   | 否   |
| preload                  | boolean                               | 视频是否预加载，`autoplay=false`才会生效                     | true                    | 否   |
| autoplay                 | boolean                               | 是否自动播放                                                 | false                   | 否   |
| controls                 | boolean<br />object                   | 是否展示 controllerbar                                       | true                    | 否   |
| controlbarHideTime       | number                                | 用户不活跃后，多长时间隐藏controlbar，毫秒                   | 2000                    | 否   |
| localization             | object                                | 多语言设置                                                   | 查看后面说明            | 否   |
| tracks                   | object                                | 各种 track 设置                                              | 无                      | 否   |
| fragment                 | string <br />object                   | 视频断片功能                                                 | 无                      | 否   |
| timeSliderShowFormat     | string                                | tootip 展示的时间格式，值为`time`和`date`，date 只有在 fragment 设置情况下生效。 | date                    | 否   |
| playbackRates            | array                                 | video 的 playebackRates 设置                                 | [1, 1.25, 1.5, 1.75, 2] | 否   |
| playbackRateControls     | boolean                               | 是否开启 playebackRate 控制                                  | true                    | 否   |
| videoCallback            | function                              | 打包的 js 没有这个属性，详细看后面播放器实例化 API           | 无                      | 否   |
| showLoadingLazyTime      | number                                | 延时展示 loading 的时间（毫秒）                              | 500                     | 否   |
| showErrorMessageLazyTime | number                                | 延时展示错误信息的时间（毫秒）                               | 1000                    | 否   |
| contextMenu              | boolean<br />array<br />React Element | 鼠标右击菜单                                                 | 展示一行默认信息        | 否   |
| timeout                  | number                                | 视频超时设置，10000ms 后，直播会尝试重载，尝试`retryTimes`次后，展示超时信息。而非直播则`retryTimes * timeout`后展示展示超时信息，不自动重载。 | 10 * 1000               | 否   |
| retryTimes               | number                                | 网络差时，timeout 后尝试，重新加载视频次数<br />理论上时间等于`retryTimes * timeout`后会展示超时信息，实际上，超时信息展示会大于 `retryTimes * timeout`，误差 5 秒左右。 | 1                       | 否   |
| stretching               | string                                | 调整视频大小以适合播放器尺寸。                               | uniform                 | 否   |
| selection                | object<br />boolean                   | 配合fragment使用和历史视频，截取视频，请参考下面selection说明 | undefined               | 否   |
| leftSelectionComponent   | react element                         | selection左边组件                                            | 无                      | 否   |
| rightSelectionComponent  | react element                         | selection右边组件                                            | 无                      | 否   |

#### props.controls

controls 默认为 true。

| controls       | 默认值 | 说明                                                        |
| :------------- | :----- | :---------------------------------------------------------- |
| timeSlider     | true   | 播放进度控制条（直播没有）                                  |
| playPause      | true   | 开始暂停按钮                                                |
| volume         | true   | 音量按钮                                                    |
| time           | true   | 播放时间（直播没有）                                        |
| setting        | false  | 配置（播放速度等）                                          |
| speed          | false  | 播放速度                                                    |
| subtitle       | true   | 如果有字幕默认显示                                          |
| pictureQuality | true   | 清晰度（目前只支持hls.js协议的）,如果当前m3u8包含清晰度信息 |
| rotate         | false  | 旋转（逆时针，每次增加90度）                                |
| capture        | false  | 截屏，截屏功能存在跨域问题，所以需要后端处理跨域响应头。    |

`controls=true`时，上面 controls 参数默认值为 true 的都会显示，`controls=false`控制条隐藏。

`controls={ timeSlider: false }`时，timeSlider 隐藏，其他按钮按默认值展示。

**controls 还可以自定义 controlbar 按钮**，例如自定义下载按钮：

```jsx
<Html5Player
  file="https://media.w3.org/2010/05/sintel/trailer.mp4"
  controls={{
    dowload: (
      <a className="float-right" href={file} target="_blank" download={file}>
        <svg className="nan-icon" aria-hidden="true">
          <use xlinkHref="#icon-download" />
        </svg>
      </a>
    ),
  }}
/>
```

#### props.tracks

| tracks[] | 默认值 | 说明                                  | 必填 |
| -------- | ------ | ------------------------------------- | ---- |
| kind     | 无     | 类型，目前只有`subtitle`和`thumbnail` | 是   |
| file     | 无     | web vtt文件链接                       | 是   |
| label    | 无     | subtitle列表的展示名                  | 是   |

* 字幕

  字幕是可以是列表的。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    tracks={[
      {
        kind: 'subtitle',
        file: '/subtitle-zh-cn.vtt',
        label: '中文',
      },
      {
        kind: 'subtitle',
        file: '/subtitle-en.vtt',
        label: 'English',
      }, 
    ]}
  />
  ```

* 缩略图

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    tracks={[
      {
        kind: 'thumbnail',
        file: '/thumbnail.vtt',
      },
    ]}
  />
  ```

#### props.fragment

视频断片功能，比较特殊的一个功能，这种情况比较少用。**最适合用在 m3u8，因为 m3u8 是文本，可以很简单的合并分段的视频。**

```jsx
<Html5Player
  file="https://media.w3.org/2010/05/sintel/movie.m3u8"
  fragment="/fragment.json"
/>
```

或者

```jsx
<Html5Player
  file="https://media.w3.org/2010/05/sintel/movie.m3u8"
  fragment={{
    total: {
      begin: '2017-10-03 00:00:00',
      end: '2017-10-03 00:01:19',
    },
    fragments: [
      {
        begin: '2017-10-03 00:00:02',
        end: '2017-10-03 00:00:12',
      },
      {
        begin: '2017-10-03 00:00:32',
        end: '2017-10-03 00:00:42',
      },
      {
        begin: '2017-10-03 00:00:45',
        end: '2017-10-03 00:00:52',
      },
    ],
  }}
/>
```

fragment 定义如下：

```json
{
  "total": {
    "begin": "2017-10-03 00:00:00",
    "end": "2017-10-03 00:01:19"
  },
  "fragments": [
    {
      "begin": "2017-10-03 00:00:02",
      "end": "2017-10-03 00:00:12"
    },
    {
      "begin": "2017-10-03 00:00:32",
      "end": "2017-10-03 00:00:42"
    },
    {
      "begin": "2017-10-03 00:00:45",
      "end": "2017-10-03 00:00:52"
    }
  ]
}
```

| 参数              | 类型   | 说明                                             |
| ----------------- | ------ | ------------------------------------------------ |
| total.begin       | string | 整个视频的开始时间，格式为 `YYYY-MM-DD HH:mm:ss` |
| total.end         | string | 整个视频的结束时间，格式为 `YYYY-MM-DD HH:mm:ss` |
| fragments[].begin | string | 视频断片的开始时间，格式为`YYYY-MM-DD HH:mm:ss`  |
| fragments[].end   | string | 视频断片的结束时间，格式为 `YYYY-MM-DD HH:mm:ss` |

#### props.selection

需要配合`fragments`

| 参数      | 类型   | 说明                 | 必填 |
| --------- | ------ | -------------------- | ---- |
| begin     | number | 截取开始时间，单位秒 | 否   |
| total.end | number | 截取结束时间，单位秒 | 否   |
| minGap    | number | 最小的间距，单位秒   | 否   |
| maxGap    | number | 最大的间距，单位秒   | 否   |

#### props.logo

* string

  这种情况，点击 logo 无跳转。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo="/logo.png"
  />
  ```

* object

  这种情况，点击 logo 无跳转。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo={{
      image: '/logo.png',
      link: 'https://github.com/dog-days/html5-player',
    }}
  />
  ```

* React.element

  这种情况，点击 logo 无跳转。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo={
      <a href="https://github.com/dog-days/html5-player">
        <img src="/logo.png" />
      </a>
    }
  />
  ```

#### props.localization

默认值为：

```js
//异步加载hls或flv代码，才会提示播放器加载中。
{
  loadingPlayerText: '播放器加载中...',
  unknownError: '视频加载出错',
  fileCouldNotPlay: '视频加载出错',
  timeout: '视频加载超时',
  speed: '倍速',
  normalSpeed: '正常',
  videoNotSupport: '当前浏览器不支持此视频格式',
}
```

#### props.contextMenu

* boolean

  是否展示 contextMenu，`true`是，展示默认的 contextMenu。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={false}
  />
  ```

* array

  这种情况，适合用于展示多个，展示样式也是用默认的。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={[<a href="#demo">demo</a>, <a href="#demo2">demo2</a>]}
  />
  ```

* React.element

  可以进行自定义结构和样式。

  ```jsx
  <Html5Player
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={
      <ul>
        <li>
          <a href="#demo">demo</a>
        </li>,
        <li>
          <a href="#demo2">demo2</a>
        </li>,
      </ul>
    }
  />
  ```

#### props.stretching

完全采用jwplayer的stretching用法。

- uniform

  适合播放器尺寸，同时保持宽高比。

- exactfit

  适合播放器尺寸而不保持宽高比。

- fill

  缩放和裁剪视频以填充尺寸，保持纵横比。

- none

  保持显示视频文件的实际尺寸大小。

请参考下图stretching用法。

![img](https://dog-days.github.io/demo/static/stretch-options.png)

### 播放器实例化对象

react 在 props.videoCallback 返回播放器实例

```jsx
<Html5Player
  file="/test.mp4"
  videoCallback={palyer => {
    //player参数是实例化后的播放器
  }}
/>
```

umd 打包后在 primse 对象中返回播放器实例。

```js
html5Player({
  id: 'test',
  file: '/test.mp4',
}).then(player => {
  //player参数是实例化后的播放器
});
```

#### 属性

> 这些属性值只读。

| player 属性 | 类型    | 说明                                                         |
| :---------- | :------ | :----------------------------------------------------------- |
| loading     | boolean | 加载中                                                       |
| playing     | boolean | 播放中                                                       |
| ended       | boolean | 播放是否结束                                                 |
| currentTime | number  | 当前播放时间                                                 |
| duration    | number  | 当前视频时长                                                 |
| bufferTime  | number  | 视频缓存时间，单位秒                                         |
| seeking     | boolean | 是否在 seeking，timeline 点击拖动也是在 seeking，这个跟原生的有点不一样。 |
| isError     | boolean | 视频播放是否出错                                             |

#### 方法

* play()

  播放视频。

* pause()

  暂停视频播放。

* setVolume(volume)

  控制音量。

  | 参数   | 类型   | 说明                   | 必填 |
  | ------ | ------ | ---------------------- | ---- |
  | volume | number | 音量大小，最大值为 100 | 是   |

* setMuted(flag)

  控制音量。

  | 参数 | 类型    | 说明     | 必填 |
  | ---- | ------- | -------- | ---- |
  | flag | boolean | 静音控制 | 是   |

* replay()

  重新播放。

* setSeeking(percent)

  视频播放进度选取。

  | 参数    | 类型   | 说明                                     | 必填 |
  | ------- | ------ | ---------------------------------------- | ---- |
  | percent | number | 视频播放位置，按百分比来算的，最大值为 1 | 是   |

* fullscreen(flag)

  全屏或者退出全屏操作。

  | 参数 | 类型    | 说明                      | 必填 |
  | ---- | ------- | ------------------------- | ---- |
  | flag | boolean | true 全屏，false 退出全屏 | 是   |

* controlbar(flag,delayTimeToHide,onControlbarEnter)

  控制条显示或者隐藏控制。

  | 参数                 | 类型    | 说明                                  | 必填 |
  | -------------------- | ------- | ------------------------------------- | ---- |
  | flag                 | boolean | true 显示，false 隐藏                 | 是   |
  | delayTimeToHide      | number  | 延时隐藏时间，毫秒级（只对隐藏有效）  | 否   |
  | alwaysShowControlbar | boolean | 为 true 时其他操作无法隐藏 controlbar | 否   |

* showErrorMessage(message)

  展示错误信息。

  | 参数    | 类型   | 说明                                   | 必填 |
  | ------- | ------ | -------------------------------------- | ---- |
  | message | string | 错误信息，为 null 时，错误信息不展示。 | 是   |

* playbackRate(rate)

  控制播放速度。

  | 参数 | 类型   | 说明            | 必填 |
  | ---- | ------ | --------------- | ---- |
  | rate | number | playbackRate 值 | 是   |

* setSelection(payload)

  payload参数请参考上面的`props.selection`

  ```js
  {
    begin,
    end,
    minGap,
    maxGap
  }
  ```

* on(type, callback)

  事件监控，这里可以继承所有[video DOM 事件](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)（用 addEventlisener 绑定事件一样），同时也可以监听`html5-player`的自定义事件。

  ```js
  /**
   * 监控事件
   * @param { string } type 事件类型
   * @param { function } callback 回调函数
   */
  on(type, callback) {}
  ```

* off(type)

  移除指定或者部分或者全部监控事件，包括多次绑定的事件，当 type=undefined 移除全部事件。

  ```js
  /**
   * 移除指定或者部分或者全部监控事件，包括多次绑定的事件
   * @param { string || undefined || array } type 事件类型
   */
  off(type) {}
  ```

### 自定义事件列表

可以使用实例化后的播放器监控，例如：

```js
player.on('loading', function(loading) {
  console.log(loading);
});
```

* focus

  鼠标是否聚焦在播放器，鼠标移动到播放器或者点击播放器都会聚焦，解除聚焦需要点击非播放器的其他地方。

* loading

  事件加载事件，中途因为的视频加载也会触发此事件。

* ready

  视频准备完成，可以播放（video dom dataloaded 事件触发）。

* replay

  视频播放结束，点击重新播放按钮，会触发重新播放事件。

* volume

  音量变化事件。

* seek

  视频时间轴（time-line）拖动，点击触发。

* fullscreen

  全屏事件触发，包括退出全屏。

* controlbar

  视频控制台显示与隐藏事件。

* reload

  重载事件，这个事件一般都是视频加载触发，出现刷新按钮，点击后触发。

* error

  这个错误事件是 hls 或者 flv 视频解析报错时触发的。

* selection

  触发selection操作。

  ```js
  player.setSelection({
    begin: 5,
    end: 70,
    seekingDisabled: true,//seekingDisabled禁止seeking功能，
  });
  //取消selection
  player.setSelection(false);
  ```

* hlsFragmentInfo

  返回hls.js ts文件的一些细信息，可以计算下载速度和带宽。

  | 参数        | 类型   | 说明                     |
  | ----------- | ------ | ------------------------ |
  | requestTime | number | ts网络请求时间，单位毫秒 |
  | duration    | number | ts时长，单位秒           |
  | fileSize    | number | ts文件大小，单位bit      |

#### 录像历史视频

这个模式跟fragment效果差不多，不过这里是多个视频连在一起的（简单理解：有个视频播放列表）。

props用法跟原来的player一样，不过多了个`props.historyList`，然后`props.file`不用理。

例子：

```jsx
import React from 'react';
import Player from 'html5-player/libs/history';

export default class View extends React.Component {
  state = {};
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <Player
            historyList={{
              beginDate: '2018-07-28 00:00:00',
              duration: 20 + 654 + 12 + 52 + 52 + 10 + 654 + 20,
              fragments: [
                {
                  begin: 0,
                  end: 20,
                },
                {
                  begin: 20,
                  end: 20 + 654,
                  file:
                    'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8?test=2',
                },
                {
                  begin: 20 + 654,
                  end: 20 + 654 + 12,
                },
                {
                  begin: 20 + 654 + 12,
                  end: 20 + 654 + 12 + 52,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=2',
                },
                {
                  begin: 20 + 654 + 12 + 52,
                  end: 20 + 654 + 12 + 52 + 52,
                  file:
                    'https://media.w3.org/2010/05/sintel/trailer.mp4?test=3',
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52,
                  end: 20 + 654 + 12 + 52 + 52 + 10,
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52 + 10,
                  end: 20 + 654 + 12 + 52 + 52 + 10 + 654,
                  file:
                    'https://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8',
                },
                {
                  begin: 20 + 654 + 12 + 52 + 52 + 10 + 654,
                  end: 20 + 654 + 12 + 52 + 52 + 10 + 654 + 20,
                },
              ],
            }}
          />
        </div>
      </div>
    );
  }
}

```

**historyList结构**

historyList的值可以是false，这样就是没有任何视频。

| historyList | 类型                  | 说明                                                     | 必填 |
| ----------- | --------------------- | -------------------------------------------------------- | ---- |
| begin       | number                | 当前视频（或者断片）开始时间                             | 是   |
| end         | number                | 当前视频（或者断片）结束时间                             | 是   |
| file        | string \|\| undefined | 播放的链接，为undefined时，代表无视频（time-slider置灰） | 否   |

### 播放列表

简单例子

```jsx
import React from 'react';
import Html5PlayerList from 'html5-player/playlist';

export default class View extends React.Component {
  render() {
    const playlist = [
      {
        title: 'test',
        cover: 'https://t12.baidu.com/it/u=2991737441,599903151&fm=173&app=25&f=JPEG?w=538&h=397&s=ECAA21D53C330888369488B703006041',
        file: 'https://dog-days.github.io/demo/static/react.mp4'
      }
    ];
    return (
      <Html5PlayerList
        playlist={playlist}
        autoplay
        activeItem={2}
      />
    );
  }
}
```

props

| props         | 类型             | 说明                                     | 默认值 | 必填 |
| ------------- | ---------------- | ---------------------------------------- | ------ | ---- |
| playlist      | array            | 播放列表                                 | 无     | 是   |
| activeItem    | number           | 当前播放的视频（1开始算）                | 1      | 否   |
| videoCarousel | bool<br />number | 视频走定时轮播，可以设置定时间隔（毫秒） | false  | 否   |
| 其他props     |                  | 继承video的所有props                     |        |      |

props.playlist

| playlist[] | 类型                       | 说明                               | 默认值 | 必填 |
| ---------- | -------------------------- | ---------------------------------- | ------ | ---- |
| title      | string <br />react element | 标题，覆盖Player的props.title      | 无     | 否   |
| cover      | string                     | 列表的展示封面图（跟poster不一样） | 无     | 是   |
| file       | string                     | 视频文件，覆盖Player的props.file   |        | 是   |
| 其他props  |                            | 继承video的所有props               |        |      |