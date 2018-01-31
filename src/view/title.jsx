//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import { namespace as controlbarNamespace } from '../model/controlbar';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    userActive: state[controlbarNamespace],
  };
})
export default class Title extends React.Component {
  static propTypes = {
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  };
  displayName = 'Title';
  state = {};
  render() {
    const { userActive, title } = this.props;
    return <div className={
      classnames("html5-player-title",
      {
        'html5-player-hide': !userActive || !title
      })
    }>{title}</div>;
  }
}
