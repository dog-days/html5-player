//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import isBoolean from 'lodash/isBoolean';
//内部依赖包
import clearDecorator from '../decorator/clear';
import localization from '../../i18n/default';
import PlayPause from '../controlbar/play-pause';
import Volume from '../controlbar/volume';
import FullOffScreen from '../controlbar/full-off-screen';
import Time from '../controlbar/time-container';
import TimeSlider from '../controlbar/time-slider';
import Setting from '../controlbar/setting';
import PlaybackRateComponent from '../controlbar/playback-rate';
import { CONTROLBAR_TIMEOUT } from '../../utils/const';
import { getChildProps, cloneElement } from '../../utils/util';
import { namespace as controlbarNamespace } from '../../model/controlbar';
import { namespace as videoNamespace } from '../../model/video';
import { namespace as playPauseNamespace } from '../../model/play-pause';
import { namespace as livingNamespace } from '../../model/living';
import { namespace as readyNamespace } from '../../model/ready';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    show: state[controlbarNamespace],
    playing: state[playPauseNamespace],
    living: state[livingNamespace],
    ready: state[readyNamespace],
  };
})
@clearDecorator([livingNamespace])
export default class Controlbar extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'Controlbar';
  state = {};
  dispatch = this.props.dispatch;
  onMouseEnter = e => {
    e.stopPropagation();
    const { playing } = this.props;
    if (playing) {
      this.dispatch({
        type: `${videoNamespace}/controlbarClearTimeout`,
        payload: {
          onControlbarEnter: true,
        },
      });
    }
  };
  onMouseLeave = e => {
    e.stopPropagation();
    const { playing } = this.props;
    if (playing) {
      this.dispatch({
        type: `${videoNamespace}/controlbar`,
        payload: false,
        delayTime: CONTROLBAR_TIMEOUT,
        onControlbarEnter: false,
      });
    }
  };
  getLocale() {
    return this.context.localization || localization;
  }
  renderCustomButton(buttons) {
    const buttonJSX = [];
    for (let i in buttons) {
      const button = buttons[i];
      if (!button) {
        return;
      }
      if (!React.isValidElement(button)) {
        console.error('自定义按钮必须是React组件！');
        return;
      }
      buttonJSX.push(
        cloneElement(button, {
          className: classnames(
            'html5-player-small-button',
            getChildProps(button).className
          ),
          key: i,
        })
      );
    }
    return buttonJSX;
  }
  render() {
    const {
      playbackRates,
      playbackRateControls,
      show,
      muted,
      tracks,
      isLiving,
      ready,
      timeSliderShowFormat,
      hasFragment,
    } = this.props;
    let { living } = this.props;
    if (isLiving) {
      living = true;
    }
    const locale = this.getLocale();
    let { controls = true } = this.props;
    if (isBoolean(controls)) {
      if (!controls) {
        //controls=false时，需要设置这些值为false
        controls = {
          playPause: false,
          volume: false,
          fullscreen: false,
          setting: false,
          time: false,
          timeSlider: false,
          speed: false,
        };
      } else {
        controls = {};
      }
    }
    let {
      playPause = true,
      volume = true,
      fullscreen = true,
      setting = false,
      time = true,
      timeSlider = true,
      speed = false,
      ...customButton
    } = controls;
    return (
      <div
        className={classnames('html5-player-controlbar', {
          'html5-player-hide': !show,
          'html5-player-show': show,
        })}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {ready &&
          !living &&
          timeSlider && (
            <TimeSlider
              hasFragment={hasFragment}
              tracks={tracks}
              timeSliderShowFormat={timeSliderShowFormat}
            />
          )}
        <div className="html5-player-button-container">
          {playPause && <PlayPause living={living} />}
          {volume && (
            <Volume
              autoMuted={muted}
              living={living}
              hasFragment={hasFragment}
            />
          )}
          {ready && !living && time && <Time />}
          {living && (
            <button className="html5-player-small-button cursor-default">
              <svg className="html5-player-icon html5-player-live-icon" aria-hidden="true">
                <use xlinkHref="#icon-live" />
              </svg>
            </button>
          )}
          {fullscreen && <FullOffScreen />}
          {ready &&
            setting && (
              <Setting
                living={living}
                playbackRates={playbackRates}
                playbackRateControls={playbackRateControls}
              />
            )}
          {ready &&
            !living &&
            speed && (
              <PlaybackRateComponent
                playbackRates={playbackRates}
                locale={locale}
              />
            )}
          {ready && this.renderCustomButton(customButton)}
        </div>
      </div>
    );
  }
}
