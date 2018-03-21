//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
//内部依赖包
import localization from '../../../i18n/default';

export default class List extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
  };
  displayName = 'List';
  dispatch = this.props.dispatch;
  onSelectEvent = (value, callback) => {
    return e => {
      const { onSelect } = this.props;
      onSelect && onSelect(value, e);
      callback && callback();
    };
  };
  getLocale() {
    return this.context.localization || localization;
  }
  renderBack(title) {
    const { onBackEvent } = this.props;
    if (!onBackEvent) {
      return false;
    } else {
      return (
        <li className="html5-player-list-title" onClick={onBackEvent}>
          <svg
            className="html5-player-icon html5-player-left-icon"
            aria-hidden="true"
          >
            <use xlinkHref="#icon-left" />
          </svg>
          {title}
        </li>
      );
    }
  }
}
