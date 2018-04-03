//外部依赖包
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import List from './list';
import { namespace as videoNamespace } from '../../../model/video';
import { namespace as qualityNamespace } from '../../../model/picture-quality';

@connect(state => {
  return {
    qualityList: state[qualityNamespace].list,
    currentQuality: state[qualityNamespace].currentQuality,
  };
})
export default class PictureQualityList extends List {
  displayName = 'PictureQualityList';
  onSelect = value => {
    return this.onSelectEvent(value, () => {
      this.dispatch({
        type: `${videoNamespace}/switchPictureQuality`,
        payload: value,
      });
    });
  };
  render() {
    const { qualityList, currentQuality } = this.props;
    const locale = this.getLocale();
    return (
      <ul className="html5-player-list-container">
        {this.renderBack(locale.pictureQuality)}
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
