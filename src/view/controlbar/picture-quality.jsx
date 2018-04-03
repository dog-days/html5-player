//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import classnames from 'classnames';
//内部依赖包
import Tooltip from '../components/tooltip';
import clearDecorator from '../decorator/clear';
import PictureQualityList from './setting/picture-quality-list';
import { namespace as qualityNamespace } from '../../model/picture-quality';

@connect(state => {
  return {
    qualityList: state[qualityNamespace].list,
  };
})
@clearDecorator([qualityNamespace])
export default class PictureQuality extends React.Component {
  displayName = 'PictureQuality';
  state = {};
  onSelect = value => {
    this.setState({
      tooltipKey: value,
    });
  };
  renderContent() {
    return <PictureQualityList onSelect={this.onSelect} />;
  }
  render() {
    const { qualityList, locale } = this.props;
    const { tooltipKey } = this.state;
    if (!qualityList) {
      return false;
    }
    return (
      <Tooltip
        key={tooltipKey}
        trigger="click"
        content={this.renderContent()}
        toTargetGap={20}
      >
        <span className="float-right cursor-pointer html5-player-common-button html5-player-quality-button">
          {locale.pictureQuality}
        </span>
      </Tooltip>
    );
  }
}
