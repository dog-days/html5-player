//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import { namespace as videoNamespace } from '../../../model/video';
import { namespace as trackNamespace } from '../../../model/track';
import localization from '../../../i18n/default';

@connect(state => {
  return {
    subtitleList: state[trackNamespace].subtitleList,
    subtitleId: state[trackNamespace].subtitleId,
  };
})
export default class PlaybackRateList extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'PlaybackRateList';
  dispatch = this.props.dispatch;
  onSelect = value => {
    return e => {
      const { onSelect } = this.props;
      onSelect && onSelect(value, e);
      this.dispatch({
        type: `${videoNamespace}/switchSubtitle`,
        payload: value,
      });
    };
  };
  getLocale() {
    return this.context.localization || localization;
  }
  render() {
    const { subtitleList, subtitleId, onBackEvent } = this.props;
    const locale = this.getLocale();
    return (
      <ul className="html5-player-list-container">
        {onBackEvent && (
          <li className="html5-player-list-title" onClick={onBackEvent}>
            <svg
              className="html5-player-icon html5-player-left-icon"
              aria-hidden="true"
            >
              <use xlinkHref="#icon-left" />
            </svg>
            {locale.subtitle}
          </li>
        )}
        {subtitleList &&
          subtitleList.map((v, k) => {
            const className = classnames({
              'html5-player-list-selected': subtitleId === v.id,
            });
            return (
              <li onClick={this.onSelect(v.id)} key={k} className={className}>
                {v.name}
              </li>
            );
          })}
        <li
          onClick={this.onSelect(-1)}
          key={-1}
          className={classnames({
            'html5-player-list-selected': subtitleId === -1,
          })}
        >
          {locale.subtitleOff}
        </li>
      </ul>
    );
  }
}
