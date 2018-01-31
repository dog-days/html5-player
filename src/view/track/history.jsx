//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as trackNamespace } from '../../model/track';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {};
})
@clearDecorator([trackNamespace])
export default class History extends React.Component {
  static propTypes = {};
  displayName = 'History';
  state = {};
  dispatch = this.props.dispatch;
  getData() {
    const { config } = this.props;
    this.dispatch({
      type: `${trackNamespace}/historySaga`,
      payload: config,
    });
  }
  componentDidMount() {
    this.getData();
  }
  render() {
    return false;
  }
}
