//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as loadingNamespace } from '../model/loading';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    loading: state[loadingNamespace],
  };
})
@clearDecorator([loadingNamespace])
export default class Loading extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'Loading';
  state = {};
  dispatch = this.props.dispatch;
  render() {
    const { loading } = this.props;
    if (!loading) {
      //这里不return false 是为了方便单元测试判断。
      return <div className="html5-player-loading-view html5-player-hide" />;
    }
    return (
      <div
        className="html5-player-cover-view html5-player-loading-view"
        onDoubleClick={e => {
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <svg
          className="html5-player-icon html5-player-middle-button html5-player-loading-icon"
          aria-hidden="true"
        >
          <use xlinkHref="#icon-loading" />
        </svg>
      </div>
    );
  }
}
