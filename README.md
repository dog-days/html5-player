# Nan Player

本视频播放器使用了 react、redux、redux-saga 实现了支持原生 H5 Video 的所有格式，同时添加了对 HLS 和 FLV 的支持。为了减轻打包 js 文件，兼容了 preact 替换 react，打包后的 js 文件 gzip 后的大小为**77KB**左右（hls 和 flv 的代码是会根据视频类型动态加载的，视频类型根据文件后缀名判别）。

> **不使用 react 的项目一样可以使用 nan-player，不过打包后的代码包含了react相关代码，如果使用jsx语法，那么用法大部分基本一致。当然建议使用react更好，如果使用react、redux、redux-saga，除开这些依赖代码，nan-player的代码，包括图片样式，gzip后在20KB以内。**

## 功能

* 原生 H5 支持的视频源播放
* HLS 视频播放
* FLV 视频播放
* 字幕
* 缩略图预览
* 播放速度
* 视频断片功能（这个是个额外功能）

## 兼容性

兼容 IE10 以上，Edge、谷歌、火狐、Opera、Safari 等主流浏览器。但是由于需要支持 HLS 和 FLV，HLS 只兼容了 IE11。FLV 也是只兼容了到 IE11 和 Sarari 10 版本以上。

> 不支持音频文件的 UI，目前本项目只处理了视频 UI。

> 目前只支持 PC 端，暂不支持移动端。

## 入门使用

### 安装

首先安装`nan-player`

```sh
npm i nan-player -S
```

或者 clone 本项目，运行下面的命令

```sh
npm install
npm run build
#npm run serve-umd-build 可以查看启动服务umd demo。
#npm run start 可以查看开发环境demo
#npm run build-demo可以构建项目demo
#npm run serve-demo-build 可以启动服务查看项目demo
```

构建后的 js 文件生成在`dist`目录下，直接使用 dist 目录下的 nanPlayer.js，然后调用全局变量 window.nanPlayer 使用即可。

### 使用

在 react 中的使用，react 版本要求是 v15.x 以上，还需要引入样式：

```js
import 'nan-player/libs/assets/css/style.css';
```

```jsx
import React from 'react';
import NanPlayer from 'nan-player';
class View extends React.Component {
  render() {
    return (
      <NanPlayer
        title="这里是标题"
        file="/test.mp4"
        //logo支持string，React Element和plainObject
        logo={{
          image: '/logo.png',
          link: 'https://github.com/dog-days/nan-player',
        }}
        videoCallback={palyer => {
          //player参数是实例化后的播放器，详情请看后续API
        }}
      />
    );
  }
}
```

如果使用的是打包后的 nanPlayer.js，使用如下：

```html
<script src="/nanPlayer.js"></script>
...
<div id="test"></div>
<script>
  //nanPlayer是全局变量
  //返回的是promise对象。
  //打包后的nan-player，window.React可以直接使用。
  nanPlayer({
    //比react的props要多一个id
    //元素id
    id: 'test',
    title: "这里是标题",
    file: "/test.mp4",
    //logo支持string，React Element和plainObject
    logo: {
      image: '/logo.png',
      link: 'https://github.com/dog-days/nan-player',
    },
    //打包后的nan-player，window.React可以直接使用。
    children: React.createElement('div',{},"这里是标题"),
  }).then(player=>{
    //player参数是实例化后的播放器，详情请看后续API
  })
</script>
...
```

**如果使用 flv 直播，需要设置 enableWorker，可以减少延时到 1 秒左右。 但是如果不是直播，不可以设置，否则会报错。**

```jsx
<NanPlayer
  flvConfig={{ enableWorker: true }}
  title="这里是标题"
  file="/test.mp4"
  //logo支持string，React Element和plainObject
  logo={{
    image: '/logo.png',
    link: 'https://github.com/dog-days/nan-player',
  }}
/>
```

## API

### 播放器 props 参数

```jsx
//react jsx用法
<Napplayer {...props} />
//umd用法 nanPlayer(props)
```

参数如下：

| props                    | 类型                                    | 说明                                       | 默认值                     | 是否必填 |
| ------------------------ | ------------------------------------- | ---------------------------------------- | ----------------------- | ---- |
| file                     | sting                                 | 视频文件路径                                   | 无                       | 是    |
| isLiving                 | boolean                               | 强制设置为直播状态。safari中flv无法获取直播状态，所以需要设置这个。   | false                   | 否    |
| height                   | string <br />number                   | 播放器高度，不设置高度时，父元素的高度需要设置。                 | 100%                    | 否    |
| width                    | string <br />number                   | 播放器宽度                                    | 100%                    | 否    |
| title                    | string<br />React.element             | 标题                                       | 无                       | 否    |
| logo                     | string<br />React.element<br />object | logo                                     | 无                       | 否    |
| poster                   | string                                | video 的 poster，海报图                       | 无                       | 否    |
| aspectratio              | string                                | 播放器纵横比，<br />只有设置了width才有效<br />，格式为`x:y` | 16:9                    | 否    |
| muted                    | boolean                               | 是否静音                                     | false                   | 否    |
| loop                     | boolean                               | 是否循环播放                                   | false                   | 否    |
| autoplay                 | boolean                               | 是否自动播放                                   | false                   | 否    |
| controls                 | boolean<br />object                   | 是否展示 controllerbar                       | true                    | 否    |
| localization             | object                                | 多语言设置                                    | 查看后面说明                  | 否    |
| tracks                   | object                                | 各种 track 设置                              | 无                       | 否    |
| fragment                 | string                                | 视频断片功能                                   | 无                       | 否    |
| timeSliderShowFormat     | string                                | tootip展示的时间格式，值为`time`和`date`，date只有在fragment设置情况下生效。 | time                    | 否    |
| playbackRates            | array                                 | video 的 playebackRates 设置                | [1, 1.25, 1.5, 1.75, 2] | 否    |
| playbackRateControls     | boolean                               | 是否开启 playebackRate 控制                    | true                    | 否    |
| videoCallback            | function                              | 打包的 js 没有这个属性，详细看后面播放器实例化 API            | 无                       | 否    |
| showLoadingLazyTime      | number                                | 延时展示loading的时间（毫秒）                       | 500                     | 否    |
| showErrorMessageLazyTime | number                                | 延时展示错误信息的时间（毫秒）                          | 1000                    | 否    |
| contextMenu              | boolean<br />array<br />React Element | 鼠标右击菜单                                   | 展示一行默认信息                | 否    |
| timeout                  | number                                | 视频超时设置，5000ms后，直播会尝试重载，尝试`retryTimes`次后，展示超时信息。而非直播则`retryTimes * timeout`后展示展示超时信息，不自动重载。 | 5000                    | 否    |
| retryTimes               | number                                | 网络差时，timeout后尝试，重新加载视频次数<br />理论上时间等于`retryTimes * timeout`后会展示超时信息，实际上，超时信息展示会大于 `retryTimes * timeout`，误差5秒左右。 | 2                       | 否    |

#### props.controls

controls 默认为 true。

| controls 参数 | 说明            | 默认值   |
| ------------ | ------------- | ----- |
| timeSlider   | 播放进度控制条（直播没有） | true  |
| playPause    | 开始暂停按钮        | true  |
| volume       | 音量按钮          | true  |
| time         | 播放时间（直播没有）    | true  |
| setting      | 配置（播放速度等）     | false |
| speed        | 播放速度          | false |

`controls=true`时，上面 controls 参数默认值为 true 的都会显示，`controls=false`控制条隐藏。

`controls={ timeSlider: false }`时，timeSlider 隐藏，其他按钮按默认值展示。

**controls 还可以自定义 controlbar 按钮**，例如自定义下载按钮：

```jsx
<NanPlayer
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

* 字幕

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    tracks={[
      {
        kind: 'captions',
        file: '/caption.vtt',
      },
    ]}
  />
  ```

* 缩略图

  ```jsx
  <NanPlayer
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

视频断片功能，比较特殊的一个功能，这种情况比较少用。**最适合用在m3u8，因为m3u8是文本，可以很简单的合并分段的视频。**

```jsx
<NanPlayer
  file="https://media.w3.org/2010/05/sintel/movie.m3u8"
  fragment='/fragment.json'
/>
```

fragment定义如下：

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

| 参数                | 类型     | 说明                                  |
| ----------------- | ------ | ----------------------------------- |
| total.begin       | string | 整个视频的开始时间，格式为 `YYYY-MM-DD HH:mm:ss` |
| total.end         | string | 整个视频的结束时间，格式为 `YYYY-MM-DD HH:mm:ss` |
| fragments[].begin | string | 视频断片的开始时间，格式为`YYYY-MM-DD HH:mm:ss`  |
| fragments[].end   | string | 视频断片的结束时间，格式为 `YYYY-MM-DD HH:mm:ss` |

#### props.logo

* string

  这种情况，点击 logo 无跳转。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo="/logo.png"
  />
  ```

* object

  这种情况，点击 logo 无跳转。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo={{
      image: '/logo.png',
      link: 'https://github.com/dog-days/nan-player',
    }}
  />
  ```

* React.element

  这种情况，点击 logo 无跳转。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    logo={
      <a href="https://github.com/dog-days/nan-player">
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
  unknownError: '发生了未知错误',
  fileCouldNotPlay: '视频加载出错',
  timeout: '视频加载超时',
  speed: '倍速',
  normalSpeed: '正常',
}
```

#### props.contextMenu

- boolean

  是否展示contextMenu，`true`是，展示默认的contextMenu。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={false}
  />
  ```

- array

  这种情况，适合用于展示多个，展示样式也是用默认的。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={[
      <a href="#demo">demo</a>,
      <a href="#demo2">demo2</a>,
    ]}
  />
  ```

- React.element

  可以进行自定义结构和样式。

  ```jsx
  <NanPlayer
    file="https://media.w3.org/2010/05/sintel/trailer.mp4"
    contextMenu={
      <ul>
        <li><a href="#demo">demo</a></li>,
        <li><a href="#demo2">demo2</a></li>,
      </ul>
    }
  />
  ```

### 播放器实例化对象

react 在 props.videoCallback 返回播放器实例

```jsx
<NanPlayer
  file="/test.mp4"
  videoCallback={palyer => {
    //player参数是实例化后的播放器
  }}
/>
```

umd 打包后在 primse 对象中返回播放器实例。

```js
nanPlayer({
  id: 'test',
  file: '/test.mp4',
}).then(player => {
  //player参数是实例化后的播放器
});
```

#### 属性

> 这些属性值只读。

| player 属性   | 类型      | 说明                                       |
| ----------- | ------- | ---------------------------------------- |
| loading     | boolean | 加载中                                      |
| playing     | boolean | 播放中                                      |
| ended       | boolean | 播放是否结束                                   |
| currentTime | number  | 当前播放时间                                   |
| duration    | number  | 当前视频时长                                   |
| bufferTime  | number  | 视频缓存时间，单位秒                               |
| seeking     | boolean | 是否在 seeking，timeline 点击拖动也是在 seeking，这个跟原生的有点不一样。 |
| isError     | boolean | 视频播放是否出错                                 |

#### 方法

* play()

  播放视频。

* pause()

  暂停视频播放。

* setVolume(volume)

  控制音量。

  | 参数     | 类型     | 说明            | 必填   |
  | ------ | ------ | ------------- | ---- |
  | volume | number | 音量大小，最大值为 100 | 是    |

* setMuted(flag)

  控制音量。

  | 参数   | 类型      | 说明   | 必填   |
  | ---- | ------- | ---- | ---- |
  | flag | boolean | 静音控制 | 是    |

* replay()

  重新播放。

* setSeeking(percent)

  视频播放进度选取。

  | 参数      | 类型     | 说明                    | 必填   |
  | ------- | ------ | --------------------- | ---- |
  | percent | number | 视频播放位置，按百分比来算的，最大值为 1 | 是    |

* fullscreen(flag)

  全屏或者退出全屏操作。

  | 参数   | 类型      | 说明                 | 必填   |
  | ---- | ------- | ------------------ | ---- |
  | flag | boolean | true 全屏，false 退出全屏 | 是    |

* controlbar(flag,delayTimeToHide,onControlbarEnter)

  控制条显示或者隐藏控制。

  | 参数                   | 类型      | 说明                          | 必填   |
  | -------------------- | ------- | --------------------------- | ---- |
  | flag                 | boolean | true 显示，false 隐藏            | 是    |
  | delayTimeToHide      | number  | 延时隐藏时间，毫秒级（只对隐藏有效）          | 否    |
  | alwaysShowControlbar | boolean | 为 true 时其他操作无法隐藏 controlbar | 否    |

* showErrorMessage(message)

  展示错误信息。

  | 参数      | 类型     | 说明                     | 必填   |
  | ------- | ------ | ---------------------- | ---- |
  | message | string | 错误信息，为 null 时，错误信息不展示。 | 是    |

* playbackRate(rate)

  控制播放速度。

  | payload | 类型     | 说明             | 必填   |
  | ------- | ------ | -------------- | ---- |
  | rate    | number | playbackRate 值 | 是    |

* on(type, callback)

  事件监控，这里可以继承所有[video DOM 事件](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)（用 addEventlisener 绑定事件一样），同时也可以监听`nan-player`的自定义事件。

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

* trigger(name, ...params)

  触发自定义事件。

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

  视频准备完成，可以播放（video dom dataloaded事件触发）。

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
