//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import classnames from 'classnames';
import isArray from 'lodash/isArray';
//内部依赖包

export default class ContextMenu extends React.Component {
  displayName = 'ContextMenu';
  render() {
    const { content, className, ...other } = this.props;
    if (content === true) {
      return (
        <ul
          className={classnames('html5-player-list-container', className)}
          {...other}
        >
          {window.html5PlayerVersion && (
            <li>Html5 Player v{window.html5PlayerVersion}</li>
          )}
          {!window.html5PlayerVersion && <li>Html5 Player</li>}
        </ul>
      );
    } else if (React.isValidElement(content)) {
      return content;
    } else if (isArray(content)) {
      return (
        <ul
          className={classnames('html5-player-list-container', className)}
          {...other}
        >
          {content.map((v, k) => {
            return <li key={k}>{v}</li>;
          })}
        </ul>
      );
    } else {
      return false;
    }
  }
}
