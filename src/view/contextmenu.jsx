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
        <ul className={classnames('nan-list-container', className)} {...other}>
          {process.NANPLAERVERSION && (
            <li>Nan Player v{process.NANPLAERVERSION}</li>
          )}
          {!process.NANPLAERVERSION && <li>Nan Player</li>}
        </ul>
      );
    } else if (React.isValidElement(content)) {
      return content;
    } else if (isArray(content)) {
      return (
        <ul className={classnames('nan-list-container', className)} {...other}>
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
