//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import isString from 'lodash/isString';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as loadingNamespace } from '../model/loading';
import { namespace as errorMessageNamespace } from '../model/error-message';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  const { loading, message: loadingMessage, retryReloadTime, type } = state[
    loadingNamespace
  ];
  return {
    loading,
    loadingMessage,
    retryReloadTime,
    type,
    errorInfo: state[errorMessageNamespace],
  };
})
@clearDecorator([loadingNamespace])
export default class Loading extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'Loading';
  state = {};
  dispatch = this.props.dispatch;
  getClassName(flag) {
    const { loadingMessage } = this.props;
    return classnames('html5-player-cover-view html5-player-loading-view', {
      'html5-player-hide': flag,
      'html5-player-loading-view-message': loadingMessage,
    });
  }
  renderLoadingMessage() {
    const {
      loadingMessage,
      LoadingMessageComponent,
      retryReloadTime,
      type,
    } = this.props;
    let props = {
      count: retryReloadTime,
      loadingMessage,
      type,
    };
    if (LoadingMessageComponent && isString(LoadingMessageComponent.type)) {
      props = {};
    }
    return (
      <span className="html5-player-loading-message">
        {loadingMessage && LoadingMessageComponent
          ? React.cloneElement(LoadingMessageComponent, props)
          : loadingMessage}
      </span>
    );
  }
  render() {
    const { loading } = this.props;
    const { message: errorMessage } = this.props.errorInfo;
    // console.log(loadingMessage);
    if (!loading || errorMessage) {
      //这里不return false 是为了方便单元测试判断。
      return <div className={this.getClassName(true)} />;
    }
    return (
      <div
        className={this.getClassName()}
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
        {this.renderLoadingMessage()}
      </div>
    );
  }
}
