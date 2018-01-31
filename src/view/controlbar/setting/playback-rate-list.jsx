//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
//import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import { namespace as videoNamespace } from '../../../model/video';
import { DEFAULT_PLAYBACKRATES } from '../../../utils/const';
import localization from '../../../i18n/default';

export default class PlaybackRateList extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'PlaybackRateList';
  dispatch = this.props.dispatch;
  onRateSelect = rate => {
    return e => {
      const { onSelect } = this.props;
      onSelect && onSelect(rate, e);
      this.dispatch({
        type: `${videoNamespace}/playbackRate`,
        payload: rate,
      });
    };
  };
  getLocale() {
    return this.context.localization || localization;
  }
  render() {
    const { playbackRate } = this.props;
    const { playbackRates = DEFAULT_PLAYBACKRATES, onBackEvent } = this.props;
    const locale = this.getLocale();
    return (
      <ul className="html5-player-rate-container">
        {onBackEvent && (
          <li className="html5-player-rate-title" onClick={onBackEvent}>
            <svg className="html5-player-icon html5-player-left-icon" aria-hidden="true">
              <use xlinkHref="#icon-left" />
            </svg>
            {locale.speed}
          </li>
        )}
        {playbackRates &&
          playbackRates.map((v, k) => {
            const className = classnames({
              'html5-player-rate-selected': playbackRate === v,
            });
            return (
              <li onClick={this.onRateSelect(v)} key={k} className={className}>
                <span className="html5-player-rate">{v + locale.speed}</span>
              </li>
            );
          })}
      </ul>
    );
  }
}
