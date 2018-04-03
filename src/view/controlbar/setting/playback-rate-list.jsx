//外部依赖包
import React from 'react';
//import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import List from './list';
import { namespace as videoNamespace } from '../../../model/video';
import { DEFAULT_PLAYBACKRATES } from '../../../utils/const';

export default class PlaybackRateList extends List {
  displayName = 'PlaybackRateList';
  onSelect = value => {
    return this.onSelectEvent(value, () => {
      this.dispatch({
        type: `${videoNamespace}/playbackRate`,
        payload: value,
      });
    });
  };
  render() {
    const { playbackRate } = this.props;
    const { playbackRates = DEFAULT_PLAYBACKRATES } = this.props;
    const locale = this.getLocale();
    return (
      <ul className="html5-player-rate-container">
        {this.renderBack(locale.speed)}
        {playbackRates &&
          playbackRates.map((v, k) => {
            const className = classnames({
              'html5-player-rate-selected': playbackRate === v,
            });
            return (
              <li onClick={this.onSelect(v)} key={k} className={className}>
                <span className="html5-player-rate">{v + locale.speed}</span>
              </li>
            );
          })}
      </ul>
    );
  }
}
