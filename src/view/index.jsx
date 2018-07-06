//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import loader from '../loader';
import * as util from '../utils/util';
import * as logger from '../utils/logger';
import addEventListener from '../utils/dom/addEventListener';
import localizationDefault from '../i18n/default';
import ContextMenu from './components/contextmenu';
import ContextMenuView from './contextmenu';
import Loading from './loading';
import End from './end';
import NotAutoPlay from './not-autoplay';
import Controlbar from './controlbar';
import ErrorMessage from './error-message';
import Subtitle from './track/subtitle';
import Title from './title';
import Fragment from './fragment';
import { CONTROLBAR_TIMEOUT, ASPECT_RATIO } from '../utils/const';
import { namespace as videoNamespace } from '../model/video';
import { namespace as fullscreenNamespace } from '../model/fullscreen';
import { namespace as playPauseNamespace } from '../model/play-pause';
import { namespace as controlbarNamespace } from '../model/controlbar';
import { namespace as livingNamespace } from '../model/living';

@connect(state => {
  return {
    living: state[livingNamespace],
    isFull: state[fullscreenNamespace],
    playing: state[playPauseNamespace],
    //controlbar的显示与否，代表了用户是否活跃
    userActive: state[controlbarNamespace],
  };
})
//播放器删除，卸载后，还原所有state状态，异常事件监控等。
//只要用到redux，每个组件基本都有相应的clearDecorator
@clearDecorator([videoNamespace])
export default class View extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {
    //播放的文件
    file: PropTypes.string.isRequired,
    //播放开始之前要显示的海报图像的URL
    poster: PropTypes.string,
    //播放器纵横比，默认为16:9，只有设置了宽度的情况下才会生效。
    //格式为x:y
    aspectratio: PropTypes.string,
    stretching: PropTypes.string,
    /**---begin Behavior**/
    //静音
    muted: PropTypes.bool,
    //preload=true，提前加载视频，false为不提前加载视频
    //默认preload=true
    //autoplay优先与preload
    preload: PropTypes.bool,
    //自动播放
    autoplay: PropTypes.bool,
    //播完重复播放
    loop: PropTypes.bool,
    //强制定义为直播
    isLiving: PropTypes.bool,
    showLoadingLazyTime: PropTypes.number,
    //直播最大buffer
    livingMaxBuffer: PropTypes.number,
    //自定义timeout时间
    timeout: PropTypes.number,
    //尝试重连次数
    retryTimes: PropTypes.number,
    //默认为time
    timeSliderShowFormat: PropTypes.string,
    /**---end Behavior**/
    /**---begin Appearance**/
    //多语言
    localization: PropTypes.object,
    controls: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    fragment: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**---end Appearance**/
    tracks: PropTypes.array,
    playbackRates: PropTypes.array,
    playbackRateControls: PropTypes.bool,
    logo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.element,
    ]),
  };
  static childContextTypes = {
    playerConainerDOM: PropTypes.object,
    localization: PropTypes.object,
    //实例化后的player，可直接调用对外api，给使用者调用。
    player: PropTypes.object,
    playerDOM: PropTypes.object,
  };
  outSideApi = {};
  getChildContext() {
    return {
      playerConainerDOM: this.playerConainerDOM,
      localization: this.props.localization,
      player: this.outSideApi,
      playerDOM: ReactDOM.findDOMNode(this.refs.video),
    };
  }
  state = {
    //是否准备好，准备好就可以开始处理video的属性问题，就可以开始播放了
    ready: false,
  };
  dispatch = this.props.dispatch;
  init() {
    const videoDOM = ReactDOM.findDOMNode(this.refs.video);
    this.videoDOM = videoDOM;
    let {
      forceOpenHls = false,
      file,
      videoCallback,
      preload = true,
      ...other
    } = this.props;
    if (!isString(file)) {
      file = '';
    }
    file = util.urlProtocolAdapter(file);
    let hlsjs = util.shouldUseHlsjs(file, forceOpenHls);
    let flvjs = util.shouldUseFlvjs(file);
    let videoNotSupport = false;
    if (!hlsjs && !flvjs && !util.isH5VideoSupported(file)) {
      //通过后缀名判断，没有后缀名不作处理，如果不支持原生的浏览器video格式，需要提示。
      videoNotSupport = true;
    }
    loader({ hlsjs, flvjs, videoDOM, file, ...other }).then(provider => {
      //首先统一清理，可能会存在上一个的播放状态。
      this.dispatch({
        type: `${videoNamespace}/clear`,
      });
      if (isPlainObject(other.controls) && other.controls.capture) {
        //屏幕截图功能需要设置crossorigin，safari和edge才不会报安全问题。
        //但是有一个缺点，播放链接响应请求头必须设置跨域。
        provider.api.setAttribute('crossorigin', 'anonymous');
      }
      this.dispatch({
        type: `${videoNamespace}/init`,
        payload: {
          dispatch: this.dispatch,
          config: {
            isHls: util.isM3u8File(file),
            isFlv: util.isFlvFile(file),
            videoNotSupport,
            file,
            preload,
            ...other,
          },
          api: provider.api,
          hlsjsEvents: provider.hlsjsEvents,
          videoCallback,
        },
        initOverCallback: outSideApi => {
          logger.success(
            'Init Over:',
            'initialized sucessfully,video is now playing(or can be played).'
          );
          this.outSideApi = outSideApi;
          this.setState({
            ready: true,
          });
        },
      });
    });
  }
  componentDidMount() {
    this.playerConainerDOM = ReactDOM.findDOMNode(
      this.refs['player-container']
    );
    //react jsx直接绑定事件在高德地图上mousemove失效，而下面的这种绑定方式不失效。
    this.palyerMousemoveEvent = addEventListener(
      this.playerConainerDOM,
      'mousemove',
      this.onMouseMove
    );
    this.init();
  }
  componentDidUpdate(prevProps) {
    if (this.props.file !== prevProps.file) {
      this.setState(
        {
          ready: false,
        },
        () => {
          this.init();
        }
      );
    }
  }
  componentWillUnmount() {
    this.palyerMousemoveEvent.remove();
  }
  onDoubleClick = e => {
    e.stopPropagation();
    const { isFull, onDoubleClick } = this.props;
    let flag = true;
    if (onDoubleClick) {
      const reFlag = onDoubleClick(e);
      if (reFlag === false) {
        //如果返回的是false，则处理flag，否则正常执行。
        flag = false;
      }
    }
    if (flag) {
      this.dispatch({
        type: `${videoNamespace}/fullscreen`,
        payload: !isFull,
      });
    }
  };
  onClick = e => {
    e.stopPropagation();
    const { living } = this.props;
    if (living) {
      //直播不跟暂停播放
      return;
    }
    const { playing, onClick } = this.props;
    let flag = true;
    if (onClick) {
      const reFlag = onClick(e);
      if (reFlag === false) {
        //如果返回的是false，则处理flag，否则正常执行。
        flag = false;
      }
    }
    //如果flag不为true，不执行下面的操作
    if (flag) {
      if (playing) {
        this.dispatch({
          type: `${videoNamespace}/pause`,
        });
      } else {
        this.dispatch({
          type: `${videoNamespace}/play`,
        });
      }
    }
  };
  dispatchControlbar(payload, CONTROLBAR_TIMEOUT) {
    this.dispatch({
      type: `${videoNamespace}/controlbar`,
      payload,
      delayTime: CONTROLBAR_TIMEOUT,
    });
  }
  onMouseMove = e => {
    const { controls = true, playing, userActive } = this.props;
    if (controls && playing) {
      //清理定时器，其他组件操作也可以处理当前组件的定时器，和video model中的定时器
      this.dispatch({
        type: `${videoNamespace}/controlbarClearTimeout`,
      });
      this.dispatchControlbar(false, CONTROLBAR_TIMEOUT);
      if (!userActive) {
        this.dispatchControlbar(true);
      }
    }
  };
  getAspectratioNumber(aspectratio) {
    let ratio = aspectratio.split(':');
    if (ratio.length !== 2 || isNaN(ratio[0]) || isNaN(ratio[1])) {
      logger.warn(
        'Config error:',
        'Aspectratio format is wrong,aspectratio format should be "x:y".'
      );
      aspectratio = ASPECT_RATIO;
      ratio = aspectratio.split(':');
    }
    return {
      x: parseInt(ratio[0], 10),
      y: parseInt(ratio[1], 10),
    };
  }
  getContainerStyle() {
    let {
      aspectratio = ASPECT_RATIO,
      isFull,
      height,
      width,
      style,
    } = this.props;
    let containerStyle = {};
    if (!isFull) {
      if (width) {
        containerStyle.width = width;
      }
      if (height) {
        containerStyle.height = height;
      }
      if (width && !height && this.playerConainerDOM) {
        //第二次渲染，执行在计算height之前
        width = this.playerConainerDOM.clientWidth;
      }
      if (isNumber(width) && !height) {
        //width是数字是才计算
        const ratio = this.getAspectratioNumber(aspectratio);
        containerStyle.height = width * ratio.y / ratio.x;
      }
      if (style) {
        containerStyle = {
          ...containerStyle,
          ...style,
        };
      }
    }
    return containerStyle;
  }
  render() {
    const { ready } = this.state;
    let {
      file,
      autoplay,
      muted,
      controls = true,
      poster,
      userActive,
      tracks = [],
      className,
      title,
      playbackRates,
      playbackRateControls,
      logo,
      loop,
      localization,
      contextMenu = true,
      fragment,
      isLiving,
      timeSliderShowFormat = 'time',
      living,
      stretching = 'uniform',
      children,
    } = this.props;
    const locale = localization || localizationDefault;
    const containerStyle = this.getContainerStyle();
    let videoProps = {};
    if (ready) {
      videoProps = {
        onDoubleClick: this.onDoubleClick,
        onClick: this.onClick,
        poster: poster,
      };
    }
    return (
      <ContextMenu
        ref="player-container"
        overflow={false}
        content={<ContextMenuView content={contextMenu} />}
      >
        <div
          key={file}
          className={classnames('html5-player-container', className, {
            'cursor-none': !userActive,
          })}
          style={containerStyle}
        >
          {!ready && (
            <span className="html5-player-init-text">
              {locale.loadingPlayerText}
            </span>
          )}
          <video
            loop={loop}
            className={classnames('html5-player-tag', {
              'cursor-none': !userActive,
              'cursor-pointer': !(isLiving || living),
              [`html5-player-tag-stretching-${stretching}`]: true,
            })}
            ref="video"
            {...videoProps}
          />
          <div
            //视频保护色，纯白的需要保护色
            className="html5-player-pretect-bg"
          />
          {ready && (
            <span>
              {isString(logo) && (
                <img
                  className="html5-player-logo-container"
                  alt=""
                  src={logo}
                />
              )}
              {React.isValidElement(logo) && (
                <div className="html5-player-logo-container">{logo}</div>
              )}
              {isPlainObject(logo) && (
                <a
                  className="html5-player-logo-container"
                  href={logo.link || ''}
                  target={logo.target || '__blank'}
                >
                  <img alt="" src={logo.image} />
                </a>
              )}
              <span>
                {title && <Title title={title} />}
                <Loading />
                <End />
                <ErrorMessage />
                {!autoplay && <NotAutoPlay />}
                {controls && (
                  <Controlbar
                    tracks={tracks}
                    playbackRates={playbackRates}
                    playbackRateControls={playbackRateControls}
                    muted={muted}
                    controls={controls}
                    isLiving={isLiving}
                    localization={localization}
                    timeSliderShowFormat={timeSliderShowFormat}
                    hasFragment={!!fragment}
                    loadHtml2canvasBundle={this.loadHtml2canvasBundle}
                  />
                )}
                <Subtitle userActive={userActive} />
                {fragment && <Fragment url={fragment} />}
              </span>
              {children}
            </span>
          )}
        </div>
      </ContextMenu>
    );
  }
}
