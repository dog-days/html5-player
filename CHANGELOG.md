## 0.5.10(2010-02-27)

#### Bug Fix

* 解决 hls.js 报错,非 dubug 模式下事件无响应问题

#### Update

无

#### New Function

无

## 0.5.9(2010-02-27)

#### Bug Fix

* 解决 hls.js 解析转换报错事件不触发的问题

#### Update

无

#### New Function

无

## 0.5.8(2010-02-25)

#### Bug Fix

* 解决 button 默认类型导致 form 表单提交问题

#### Update

无

#### New Function

无

## 0.5.7(2010-01-15)

升级 flv.ly.js（添加了一个 isCigLocalRecord 配置项）

#### Bug Fix

无

#### Update

无

#### New Function

无

## 0.5.5(2018-12-26)

#### Bug Fix

* 解决历史视频 defaultCurrentTime 在第一个视频不生效的问题

#### Update

无

#### New Function

无

## 0.5.4(2018-11-21)

#### Bug Fix

* 解决 time tooltip 不显示问题

#### Update

无

#### New Function

无

## 0.5.3(2018-11-20)

#### Bug Fix

无

#### Update

* 重写 `history player`
* 对外提供 `history player` `setSeeking` API
* 新增 `history player` `defaultCurrentTime` prop 配置

#### New Function

无

## 0.5.2(2018-09-21)

#### Bug Fix

* 解决播放视频重连次数上限后，没有 detach media 的问题

* 解决 edge hls 不重连和 edge 上重连次数到上限后，还会继续重连问题

#### Update

无

#### New Function

无

## 0.5.1(2018-09-20)

#### Bug Fix

* 解决非直播视频播放重连，没记录播放进度问题

* 解决 autoplay=false，视频一开始就超时但不会重连问题
* 解决 localization 设置问题（props.localization 会覆盖全部默认的值，即使为空对象）

#### Update

无

#### New Function

无

## 0.5.0(2018-09-18)

#### Bug Fix

* 解决 safari 和 edge 播放原生 hls 时，关闭没断流问题

#### Update

* 重写报错机制和解决超时在 hls 不执行问题
* 让生成的 vresion.js 代码和 prettier 一致
* 更新 version 来源

#### New Function

* `window.html5PlayerVersion`在浏览可查看版本

## 0.4.8(2018-08-30)

#### Bug Fix

无

#### Update

* 修改 autoplay 的初始播放顺序，vidoe loaded 后才触发播放事件

#### New Function

无

## 0.4.6(2018-08-20)

#### Bug Fix

* 解决 history selection 禁止 seeking 不生效问题
* 解决浏览器宽度不够，向左滚动时 slider 不准确问题

#### Update

无

#### New Function

无

## 0.4.5(2018-08-15)

#### Bug Fix

* 解决播放时，超时计算器不重置问题
* 决 flv 事件没销毁问题

#### Update

无

#### New Function

无

## 0.4.4(2018-08-15)

#### Bug Fix

* 解决直播超时重连 retryTimes 不生效问题

#### Update

无

#### New Function

无

## 0.4.3(2018-08-15)

#### Bug Fix

* 解决 flv log 事件全局出发报错问题（这个功能暂时去掉，目前只会报超时问题）

#### Update

无

#### New Function

无

## 0.4.2(2018-08-13)

#### Bug Fix

* [解决 selection 无法取消问题，现在 selection 禁止 seeking 参数](https://github.com/dog-days/html5-player/commit/88b85cb54adc0b91356c3fa74ccd508a56af2f14)

#### Update

无

#### New Function

无

## 0.4.1(2018-08-13)

暂时去掉单元测试，这个单元测试不太合理。

#### Bug Fix

* [fix util joinUrlParams same param bug](https://github.com/dog-days/html5-player/commit/a541ad779ce5d26ad22a985fef76bf5ae89542d4)
* [fix isH5VideoSupported 无后缀名被拦截问题](https://github.com/dog-days/html5-player/commit/07bc901930d37a6f15cd95f869a7de557d29e1f2)
* [fix error controlbar hide problem](https://github.com/dog-days/html5-player/commit/cb8440c809ad74f75acd8e70c8418403446d29a5)
* [fix `//](https://github.com/dog-days/html5-player/commit/ecec21c2fec463f69ad720f759cc93d02165fa18)[www.test.com](http://www.test.com/) [模式的 url 在 flv 不生效问题`](https://github.com/dog-days/html5-player/commit/ecec21c2fec463f69ad720f759cc93d02165fa18)
* [fix localization bug](https://github.com/dog-days/html5-player/commit/879efc69ca31dc78b5bbd43564fbb4ac4ce5f005)
* [fix space key bug and provide api to cancel the feature](https://github.com/dog-days/html5-player/commit/6d19463fa02ef750a01bb03bb58b599ec18dd7e7)
* 解决了延时问题
* 解决了长时间播放画面停止不动，无提示，或者不重连的问题。

#### Update

* 自定义超时处理方式，删除之前的超时处理方式（很难控制）。
* [add controlbar button with specific className](https://github.com/dog-days/html5-player/commit/5061a73b2b30dd44c70ac30e2c287f6d9d451eac)

#### New Function

* 添加 flv 解密功能
* [对外提供 controlbar 隐藏时间接口](https://github.com/dog-days/html5-player/commit/674e9dcfce800272e46adf302882ea324112a84d)
* [selection 功能](https://github.com/dog-days/html5-player/commit/2c0e88ff941cf2581cbe8f349a38da465f334b00)，histroy player 也有这个功能。
* [新增多录像一起模式（跟 fragment 类似），即 history player](https://github.com/dog-days/html5-player/commit/125879a7947aab83c545405bda2ba33f306f86b9)
* [新增 hls.js ts 下载信息自定义事件](https://github.com/dog-days/html5-player/commit/c4bf8f4aef4a4145fa017347d97df8a8cc748413)

## 0.32(2018-05-10)

#### Bug Fix

* [fix error view svg color problem](https://github.com/dog-days/html5-player/commit/ae116420b60b63f83da77d14e6827763673df120)

#### Update

* [modify playlist,playlist cover can be react element](https://github.com/dog-days/html5-player/commit/f72de77e24252b6f83aa05c85c6877b23b4e1337)

#### New Function

无

## 0.31(2018-05-10)

#### Bug Fix

* [fix playlist css problem](https://github.com/dog-days/html5-player/commit/12e660e9cc8517959f623eb1fa888a86ad63ce90)

- [fix alias incorrect problem](https://github.com/dog-days/html5-player/commit/1d493978df6d4deebcbd9f220677245adfcceff5)

#### Update

无

#### New Function

无

## 0.30(2018-05-09)

#### Bug Fix

无

#### Update

无

#### New Function

* 播放列表功能

## 0.25(2018-04-27)

#### Bug Fix

* [fix fragment original object modified problem](https://github.com/dog-days/html5-player/commit/64f2f0c7a9dae1c8cd422b8624c3561bdb18c53a)

- [fix player event not wrok in amap](https://github.com/dog-days/html5-player/commit/f551f81fbe9c23ef98782c309d789a0df1676899)

#### Update

无

#### New Function

无

## 0.2.4(2018-04-03)

#### Bug Fix

* [fix timeline event in amap(高德地图)](https://github.com/dog-days/html5-player/commit/218dff2bc40956d7f47ab00e27ff7fcb8e844cb3)

#### Update

无

#### New Function

无

## 0.2.3(2018-04-03)

#### Bug Fix

* [fix setting of controlbar tooltip position problem](https://github.com/dog-days/html5-player/commit/056394069147cf7d2ecd1cf1efd6a653389b7c4f)
* [fix firefox setting list fall down problem](https://github.com/dog-days/html5-player/commit/34b4e0bc3a3d7f27e8bb2a6b8dbed6205fccf873)
* [fix custom subtitle problem](https://github.com/dog-days/html5-player/commit/4ecf37147133fd292ec0265e003a656953f2b653)
* [fix mousemove problem in amap(高德地图)](https://github.com/dog-days/html5-player/pull/2/commits/caf8d2d398ecf21c30d0014f1152b3ffc43afb4c)
* [fix custom subtitle off feature which does not take effect](https://github.com/dog-days/html5-player/commit/daad97eac79ebfd62b76dc58e99eefc6841aa512)
* [fix controlbar not hide when selected speed or subtitle](https://github.com/dog-days/html5-player/commit/f4a4c90ce8acb613ce986614bf3cf41dd4934de4)

#### Update

无

#### New Function

* [添加 props.stretching 属性](https://github.com/dog-days/html5-player/commit/79432a0009af5d25409a57df7d0612066db54cc7)
* [add hls subtitle feature](https://github.com/dog-days/html5-player/commit/f7e5443e20a4462fb8d0440b9caf18b290481461)
* [add hls quality swiched feature](https://github.com/dog-days/html5-player/commit/e1554a17d0167550aa4954de1c5b7b0a03f7537b)
* [add rotate feature](https://github.com/dog-days/html5-player/commit/53b3f98146102329b20c2d127d7c8ef9ea8f0870)
* [add screen capture feature](https://github.com/dog-days/html5-player/commit/77339118ff6b28b3b22ad8e94ffbebc716463ff7)

## 0.2.2(2018-03-07)

#### Bug Fix

无

#### Update

无

#### New Function

* 添加 fragment 支持传递对象功能
