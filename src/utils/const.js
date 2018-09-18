import * as storage from './storage';

//参考http://www.w3school.com.cn/tags/av_prop_readystate.asp
//没有关于音频/视频是否就绪的信息
export const HAVE_NOTHING = 0;
//关于音频/视频就绪的元数据
export const HAVE_METADATA = 1;
//关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
//timeupdate事件中可以处理状态，当做loading
export const HAVE_CURRENT_DATA = 2;
//当前及至少下一帧的数据是可用的
export const HAVE_FUTURE_DATA = 3;
//可用数据足以开始播放
export const HAVE_ENOUGH_DATA = 4;
//自定义的最大声音值
export const MAX_VOLUME = 100;

export const DEBUG = storage.get('debug');
//视频超时，超时后会超时reload，尝试3次后，报错误信息。
export const VIDEO_TIMEOUT = 1000 * 10;
//默认的播放器纵横比
export const ASPECT_RATIO = '16:9';
//用户不活跃的时候，controlbar即将消失的时间
export const CONTROLBAR_HIDE_TIME = 2000;
export const DEFAULT_PLAYBACKRATES = [1, 1.25, 1.5, 1.75, 2];
//直播最大缓存
export const LIVING_MAXBUFFER_TIME = 6;
//延时展示loading的时间
export const SHOW_LOADING_LAZY_TIME = 500;
//延时展示错误信息的时间
export const SHOW_ERROR_MESSAGE_LAZY_TIME = 500;
//尝试重连次数
export const RETRY_TIMES = 5;
