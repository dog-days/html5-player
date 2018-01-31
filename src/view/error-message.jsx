//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as videoNamespace } from '../model/video';
import { namespace as errorMessageNamespace } from '../model/error-message';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    errorInfo: state[errorMessageNamespace],
  };
})
@clearDecorator([errorMessageNamespace])
export default class ErrorMessage extends React.Component {
  //这里的配置参考jw-player的api
  static propTypes = {};
  displayName = 'ErrorMessage';
  state = {};
  dispatch = this.props.dispatch;
  reload = e => {
    this.dispatch({
      type: `${videoNamespace}/reload`,
    });
  };
  render() {
    const { message } = this.props.errorInfo;
    if (!message) {
      return false;
    }
    return (
      <div
        className="nan-cover-view nan-error-message-view"
        onDoubleClick={e => {
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className="nan-error-message-container">
          <button onClick={this.reload}>
            <svg
              className="nan-icon nan-replay-icon nan-reload "
              aria-hidden="true"
            >
              <use xlinkHref="#icon-replay" />
            </svg>
          </button>
          <div>{message}</div>
        </div>
      </div>
    );
  }
}
