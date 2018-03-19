//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import { namespace as videoNamespace } from '../../../model/video';
import { namespace as qualityNamespace } from '../../../model/picture-quality';
import localization from '../../../i18n/default';

@connect(state => {
  return {
    qualityList: state[qualityNamespace].list,
    currentQuality: state[qualityNamespace].currentQuality,
  };
})
export default class PictureQualityList extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'PictureQualityList';
  dispatch = this.props.dispatch;
  onSelect = value => {
    return e => {
      const { onSelect } = this.props;
      onSelect && onSelect(value, e);
      this.dispatch({
        type: `${videoNamespace}/switchPictureQuality`,
        payload: value,
      });
    };
  };
  getLocale() {
    return this.context.localization || localization;
  }
  render() {
    const { qualityList, currentQuality, onBackEvent } = this.props;
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
            {locale.pictureQuality}
          </li>
        )}
        {qualityList &&
          qualityList.map(v => {
            const className = classnames({
              'html5-player-list-selected': currentQuality === v.value,
            });
            return (
              <li
                onClick={this.onSelect(v.value)}
                key={v.value}
                className={className}
              >
                {v.label}
              </li>
            );
          })}
        <li
          onClick={this.onSelect(-1)}
          key={-1}
          className={classnames({
            'html5-player-list-selected': currentQuality === -1,
          })}
        >
          {locale.autoQuality}
        </li>
      </ul>
    );
  }
}
