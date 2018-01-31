//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import classnames from 'classnames';
//内部依赖包
import Tooltip from '../components/tooltip';
import clearDecorator from '../decorator/clear';
import PlaybackRateList from './setting/playback-rate-list';
import { namespace as playbackRateNamespace } from '../../model/playback-rate';
import { namespace as livingNamespace } from '../../model/living';

@connect(state => {
  return {
    playbackRate: state[playbackRateNamespace],
    living: state[livingNamespace],
  };
})
@clearDecorator([playbackRateNamespace])
export default class PlaybackRate extends React.Component {
  displayName = 'PlaybackRate';
  state = {};
  onRatteSelect = rate => {
    this.setState({
      tooltipKey: rate,
    });
  };
  renderContent() {
    return <PlaybackRateList {...this.props} onSelect={this.onRatteSelect} />;
  }
  render() {
    const { playbackRate, locale } = this.props;
    const { tooltipKey } = this.state;
    return (
      <Tooltip
        key={tooltipKey}
        trigger="click"
        content={this.renderContent()}
        toTargetGap={20}
      >
        <span className="float-right cursor-pointer html5-player-rate-button">
          {playbackRate + locale.speed}
        </span>
      </Tooltip>
    );
  }
}
