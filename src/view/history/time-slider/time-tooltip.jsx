//外部依赖包
import React from 'react';
//内部依赖包
import Tooltip from '../../components/tooltip';
import { dateFormat } from '../../../utils/util';

export default class TimeTooltip extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  static displayName = 'TimeTooltip';
  state = {
    percent: 0.5,
  };
  dispatch = this.props.dispatch;
  onChange = percent => {
    this.setState({
      percent,
    });
  };
  renderContent() {
    let { duration, beginDateTime } = this.props;
    const { percent } = this.state;
    if (duration === 0) {
      return false;
    }
    const formatTime =
      beginDateTime &&
      dateFormat(
        (beginDateTime + percent * duration) * 1000,
        'YYYY-MM-DD HH:mm:ss'
      );
    return (
      <div className="html5-player-time-tooltip-content">{formatTime}</div>
    );
  }
  render() {
    return (
      <Tooltip
        className="html5-player-time-tooltip"
        content={this.renderContent()}
        type="move"
        onChange={this.onChange}
        percent={this.state.percent}
        isAnimateActive={false}
      >
        <div className="html5-player-for-tooltip" />
      </Tooltip>
    );
  }
}
