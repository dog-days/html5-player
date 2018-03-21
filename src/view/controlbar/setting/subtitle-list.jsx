//外部依赖包
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import List from './list';
import { namespace as videoNamespace } from '../../../model/video';
import { namespace as trackNamespace } from '../../../model/track';

@connect(state => {
  return {
    subtitleList: state[trackNamespace].subtitleList,
    subtitleId: state[trackNamespace].subtitleId,
  };
})
export default class SubtitleList extends List {
  displayName = 'SubtitleList';
  onSelect = value => {
    return this.onSelectEvent(value, () => {
      this.dispatch({
        type: `${videoNamespace}/switchSubtitle`,
        payload: value,
      });
    });
  };
  render() {
    const { subtitleList, subtitleId } = this.props;
    const locale = this.getLocale();
    return (
      <ul className="html5-player-list-container">
        {this.renderBack(locale.subtitle)}
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
