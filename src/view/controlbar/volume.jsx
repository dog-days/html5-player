//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import Tooltip from '../components/tooltip';
import Slider from '../components/slider';
import { MAX_VOLUME } from '../../utils/const';
import { namespace as volumeNamespace } from '../../model/volume';
import { namespace as mutedNamespace } from '../../model/muted';
import { namespace as videoNamespace } from '../../model/video';
import * as storage from '../../utils/storage';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    volume: state[volumeNamespace],
    muted: state[mutedNamespace],
  };
})
@clearDecorator([volumeNamespace, mutedNamespace])
export default class Volume extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'Volume';
  state = {};
  dispatch = this.props.dispatch;
  componentDidMount() {
    const { autoMuted } = this.props;
    if (!autoMuted) {
      const storage_muted = storage.get('muted');
      if (storage_muted) {
        this.dispatch({
          type: `${videoNamespace}/muted`,
          payload: true,
        });
      } else {
        this.setVolumeFromLocalStorage();
      }
    }
  }
  setVolumeFromLocalStorage() {
    const { volume } = this.props;
    //声音可能为0
    const storage_volume = storage.get('volume');
    let _volume = storage_volume || volume;
    if (storage_volume === 0) {
      //处理storage_volume为0的情况。
      _volume = 0;
    }
    this.dispatch({
      type: `${videoNamespace}/volume`,
      payload: _volume,
    });
  }
  onMuteStateChange = e => {
    e.stopPropagation();
    const { muted } = this.props;
    const storage_volume = storage.get('volume');
    if (muted && storage_volume !== 0) {
      //如果是静音，解除静音后原声音值需要还原
      this.setVolumeFromLocalStorage();
    } else if (storage_volume === 0) {
      this.dispatch({
        type: `${videoNamespace}/volume`,
        //如果原声音为0，点击静音按钮，设置声音值为10
        payload: 10,
      });
    }
    if (storage_volume !== 0) {
      //进行静音或者取消静音操作
      this.dispatch({
        type: `${videoNamespace}/muted`,
        payload: !muted,
      });
    }
  };
  onSliderChange = (percent, isMove) => {
    const { muted } = this.props;
    if (muted) {
      //如果是静音，解除静音。
      this.dispatch({
        type: `${videoNamespace}/muted`,
        payload: false,
      });
    }
    this.dispatch({
      type: `${videoNamespace}/volume`,
      payload: percent * MAX_VOLUME,
    });
    this.isMove = isMove;
    if (!this.isMove) {
      //为false需要触发状态，更新，为true时redux更新了所以不用使用setState
      this.setState({ random: Math.random() });
    }
  };
  renderContent() {
    const { volume } = this.props;
    return (
      <div className="html5-player-volume-slider-container">
        <Slider
          vertical
          onChange={this.onSliderChange}
          percent={volume / MAX_VOLUME}
        />
      </div>
    );
  }
  render() {
    const { volume, muted, living, hasFragment } = this.props;
    let toTargetGap = 20;
    if (living) {
      toTargetGap = 5;
    } else if (hasFragment) {
      toTargetGap = 30;
    }
    return (
      <Tooltip
        content={this.renderContent()}
        show={this.isMove}
        toTargetGap={toTargetGap}
      >
        <span className="display-inline-block">
          <button
            className="html5-player-small-button"
            onClick={this.onMuteStateChange}
          >
            <svg
              className={classnames(
                'html5-player-icon html5-player-volume-icon',
                {
                  'html5-player-volume-full-icon': volume === 100 && !muted,
                  'html5-player-volume-x-icon': volume === 0 || muted,
                  'html5-player-volume-part-icon':
                    volume > 0 && volume < 100 && !muted,
                }
              )}
              aria-hidden="true"
            >
              <use
                xlinkHref={classnames({
                  '#icon-volume-full': volume === 100 && !muted,
                  '#icon-volume-x': volume === 0 || muted,
                  '#icon-volume-part': volume > 0 && volume < 100 && !muted,
                })}
              />
            </svg>
          </button>
        </span>
      </Tooltip>
    );
  }
}
