//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
//内部依赖包
import localization from '../../../i18n/default';
import { namespace as videoNamespace } from '../../../model/video';
import { CONTROLBAR_TIMEOUT } from '../../../utils/const';

export default class List extends React.Component {
  static contextTypes = {
    localization: PropTypes.object,
    playerDOM: PropTypes.object,
  };
  displayName = 'List';
  dispatch = this.props.dispatch;
  onSelectEvent = (value, callback) => {
    return e => {
      const { onSelect } = this.props;
      onSelect && onSelect(value, e);
      callback && callback();
      if (!this.context.playerDOM.paused) {
        //播放才处理，选择的时候因为鼠标位置已经离开了controlbar
        //所有选择完成需要，触发隐藏controlbar
        this.dispatch({
          type: `${videoNamespace}/controlbar`,
          payload: false,
          delayTime: CONTROLBAR_TIMEOUT,
          onControlbarEnter: false,
        });
      }
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
