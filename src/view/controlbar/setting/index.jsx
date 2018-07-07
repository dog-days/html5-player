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
import SubtitleList from './subtitle-list';
import PictureQualityList from './picture-quality-list';
import { namespace as playbackRateNamespace } from '../../../model/playback-rate';
import { namespace as trackNamespace } from '../../../model/track';
import { namespace as qualityNamespace } from '../../../model/picture-quality';
import contains from '../../../utils/dom/contains';
import localization from '../../../i18n/default';

const state = {
  showSetting: false,
  showRateSelect: false,
  showSubtileSelect: false,
  showPictureQualitySelect: false,
};

@connect(state => {
  return {
    playbackRate: state[playbackRateNamespace],
    subtitleList: state[trackNamespace].subtitleList,
    subtitleId: state[trackNamespace].subtitleId,
    qualityList: state[qualityNamespace].list,
    currentQuality: state[qualityNamespace].currentQuality,
  };
})
@clearDecorator([playbackRateNamespace])
export default class Setting extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'Setting';
  state = { showSetting: true };
  dispatch = this.props.dispatch;
  componentDidMount() {}
  onListClickEvent = type => {
    return e => {
      switch (type) {
        case 'rate':
          this.setState({
            ...state,
            showRateSelect: true,
          });
          break;
        case 'subtile':
          this.setState({
            ...state,
            showSubtileSelect: true,
          });
          break;
        case 'picture-quality':
          this.setState({
            ...state,
            showPictureQualitySelect: true,
          });
          break;
        default:
      }
      const settingDOM = ReactDOM.findDOMNode(this.refs.setting);
      this.documentClickEvent = addEventListener(
        settingDOM.ownerDocument,
        'mousedown',
        e => {
          if (!contains(settingDOM, e.target)) {
            this.documentClickEvent.remove();
            this.setState({
              ...state,
              showSetting: true,
            });
          }
        }
      );
    };
  };
  onSelect = (rate, e) => {
    this.documentClickEvent.remove();
    this.setState({
      ...state,
      showSetting: true,
    });
  };
  onBackEvent = e => {
    this.setState({
      ...state,
      showSetting: true,
    });
  };
  getLocale() {
    return this.context.localization || localization;
  }
  renderContent() {
    const {
      playbackRate,
      subtitleList,
      subtitleId,
      qualityList,
      currentQuality,
    } = this.props;
    const {
      showRateSelect,
      showSubtileSelect,
      showSetting,
      showPictureQualitySelect,
    } = this.state;
    const locale = this.getLocale();
    const commonIcon = (
      <svg
        className="html5-player-icon html5-player-right-icon"
        aria-hidden="true"
      >
        <use xlinkHref="#icon-right" />
      </svg>
    );
    return (
      <div className="html5-player-setting-container">
        {showSetting && (
          <ul className="html5-player-setting-list">
            {/**firxfox中需要float-right在前面，要位置会换行**/}
            <li onClick={this.onListClickEvent('rate')}>
              <span className="float-right">
                <span>{playbackRate + locale.speed}</span>
                {commonIcon}
              </span>
              <span className="float-left">{locale.speed}</span>
            </li>
            {subtitleList &&
              subtitleList[0] && (
                <li onClick={this.onListClickEvent('subtile')}>
                  {/**firxfox中需要float-right在前面，要位置会换行**/}
                  <span className="float-right">
                    {subtitleId !== -1 && (
                      <span>{subtitleList[subtitleId].name}</span>
                    )}
                    {subtitleId === -1 && <span>{locale.subtitleOff}</span>}
                    {commonIcon}
                  </span>
                  <span className="float-left">{locale.subtitle}</span>
                </li>
              )}
            {qualityList &&
              qualityList[0] && (
                <li onClick={this.onListClickEvent('picture-quality')}>
                  {/**firxfox中需要float-right在前面，要位置会换行**/}
                  <span className="float-right">
                    {currentQuality !== -1 && (
                      <span>{qualityList[currentQuality].label}</span>
                    )}
                    {currentQuality === -1 && <span>{locale.autoQuality}</span>}
                    {commonIcon}
                  </span>
                  <span className="float-left">{locale.pictureQuality}</span>
                </li>
              )}
          </ul>
        )}
        {showRateSelect && (
          <PlaybackRateList
            {...this.props}
            onSelect={this.onSelect}
            onBackEvent={this.onBackEvent}
          />
        )}
        {showSubtileSelect && (
          <SubtitleList
            onSelect={this.onSelect}
            onBackEvent={this.onBackEvent}
          />
        )}
        {showPictureQualitySelect && (
          <PictureQualityList
            onSelect={this.onSelect}
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
        toTargetGap={living ? 5 : 13}
      >
        <button className="float-right html5-player-small-button html5-player-setting-button">
          <svg
            className="html5-player-icon html5-player-setting-icon"
            aria-hidden="true"
          >
            <use xlinkHref="#icon-setting" />
          </svg>
        </button>
      </Tooltip>
    );
  }
}
