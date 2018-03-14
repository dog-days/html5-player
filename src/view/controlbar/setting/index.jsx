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
import { namespace as playbackRateNamespace } from '../../../model/playback-rate';
import { namespace as trackNamespace } from '../../../model/track';
import contains from '../../../utils/dom/contains';
import localization from '../../../i18n/default';

const state = {
  showSetting: false,
  showRateSelect: false,
  showSubtileSelect: false,
};

@connect(state => {
  return {
    playbackRate: state[playbackRateNamespace],
    subtileList: state[trackNamespace].subtileList,
    subtileId: state[trackNamespace].subtileId,
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
    const { playbackRate, subtileList, subtileId } = this.props;
    const { showRateSelect, showSubtileSelect, showSetting } = this.state;
    const locale = this.getLocale();
    return (
      <div className="html5-player-setting-container">
        {showSetting && (
          <ul className="html5-player-setting-list">
            <li onClick={this.onListClickEvent('rate')}>
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
            {subtileList &&
              subtileList[0] && (
                <li onClick={this.onListClickEvent('subtile')}>
                  <span className="float-left">{locale.subtile}</span>
                  <span className="float-right">
                    {subtileId !== -1 && (
                      <span>{subtileList[subtileId].name}</span>
                    )}
                    {subtileId === -1 && <span>{locale.subtileOff}</span>}
                    <svg
                      className="html5-player-icon html5-player-right-icon"
                      aria-hidden="true"
                    >
                      <use xlinkHref="#icon-right" />
                    </svg>
                  </span>
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
            {...this.props}
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
        <span className="display-inline-block float-right cursor-pointer">
          <button className="html5-player-small-button">
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
