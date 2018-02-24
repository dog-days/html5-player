import React from 'react';
import PropTypes from 'prop-types';
import Provider from './redux-provider';
import getSagaModel from './saga-model';

/**
 * @prop { array } middlewares redux middlewares
 * @prop { array } enhancers redux enhancers
 * @prop { object } reducers redux reducers (传进来后会被combineReducers)
 * @prop { any } preloadedState redux preloadedState
 * @prop { boolean } production 是否是生产环境，默认为true
 */
export default class ModelProvider extends React.Component {
  static propTypes = {
    middlewares: PropTypes.array,
    preloadedState: PropTypes.any,
    enhancers: PropTypes.array,
    reducers: PropTypes.object,
    production: PropTypes.bool,
  };
  static childContextTypes = {
    sagaStore: PropTypes.object,
    prefix: PropTypes.string,
  };
  getChildContext() {
    return {
      sagaStore: this.store,
      prefix: this.props.prefix,
    };
  }
  displayName = 'SagaModelProvider';
  state = {};
  componentWillUnmount() {
    this.store = null;
  }
  getStore() {
    const {
      reducers,
      preloadedState,
      models = [],
      middlewares = [],
      plugins = [],
      production = true,
    } = this.props;
    const sagaModel = getSagaModel(
      reducers,
      preloadedState,
      models,
      middlewares,
      plugins,
      !production
    );
    const store = sagaModel.store();
    return store;
  }

  render() {
    const { children, production } = this.props;
    if (!this.store) {
      this.store = this.getStore();
    }
    return (
      <Provider store={this.store} production={production}>
        {children}
      </Provider>
    );
  }
}
