//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../../decorator/clear';
import addEventListener from '../../../utils/dom/addEventListener';
import Tooltip from '../../components/tooltip';
import PlaybackRateList from './playback-rate-list';
import { namespace as playbackRateNamespace } from '../../../model/playback-rate';
import contains from '../../../utils/dom/contains';
import localization from '../../../i18n/default';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    playbackRate: state[playbackRateNamespace],
  };
})
@clearDecorator([playbackRateNamespace])
export default class Setting extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'Setting ';
  state = { showSetting: true };
  dispatch = this.props.dispatch;
  componentDidMount() {}
  onRateClickEvent = e => {
    this.setState({
      showrateSelect: true,
      showSetting: false,
    });
    const settingDOM = ReactDOM.findDOMNode(this.refs.setting);
    this.documentClickEvent = addEventListener(
      settingDOM.ownerDocument,
      'mousedown',
      e => {
        if (!contains(settingDOM, e.target)) {
          this.documentClickEvent.remove();
          this.setState({
            showrateSelect: false,
            showSetting: true,
          });
        }
      }
    );
  };
  onRatteSelect = (rate, e) => {
    this.documentClickEvent.remove();
    this.setState({
      showrateSelect: false,
      showSetting: true,
    });
  };
  onBackEvent = e => {
    this.setState({
      showrateSelect: false,
      showSetting: true,
    });
  };
  getLocale() {
    return this.context.localization || localization;
  }
  renderContent() {
    const { playbackRate } = this.props;
    const { showrateSelect, showSetting } = this.state;
    const locale = this.getLocale();
    return (
      <div className="html5-player-setting-container">
        {showSetting && (
          <ul className="html5-player-setting">
            <li onClick={this.onRateClickEvent}>
              <span className="float-left">{locale.speed}</span>
              <span className="float-right">
                <span>{playbackRate + locale.speed}</span>
                <svg
                  className="html5-player-icon html5-player-right-icon"
                  aria-hidden="true"
                >
                  <use xlinkHref="#icon-right" />
                </svg>
              </span>
            </li>
          </ul>
        )}
        {showrateSelect && (
          <PlaybackRateList
            {...this.props}
            onSelect={this.onRatteSelect}
            onBackEvent={this.onBackEvent}
          />
        )}
      </div>
    );
  }
  render() {
    const { living, playbackRateControls = true } = this.props;
    if (living || !playbackRateControls) {
      return false;
    }
    return (
      <Tooltip
        ref="setting"
        trigger="click"
        content={this.renderContent()}
        toTargetGap={living ? 5 : 10}
      >
        <span className="display-inline-block float-right cursor-pointer">
          <button
            className="html5-player-small-button"
            onClick={this.onMuteStateChange}
          >
            <svg
              className="html5-player-icon html5-player-setting-icon"
              aria-hidden="true"
            >
              <use xlinkHref="#icon-setting" />
            </svg>
          </button>
        </span>
      </Tooltip>
    );
  }
}
