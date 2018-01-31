import React from 'react';
import PropTypes from 'prop-types';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import window from 'global/window';


/**
 * redux 基础 provider
 * @prop { object } store redux store
 *                  非必要的，如果有store，reducers、middlewares和enhancers,preloadedState就不生效，传进来也没有意义
 * @prop { array } middlewares redux middlewares
 * @prop { array } enhancers redux enhancers
 * @prop { object } reducers redux reducers (传进来后会被combineReducers)
 * @prop { any } preloadedState redux preloadedState
 * @prop { boolean } production 是否是生产环境
 */
export default class ReduxProvider extends React.Component {
  static propTypes = {
    //非必要的，如果有store，reducers、middlewares和enhancers就不生效，传进来也没有意义
    store: PropTypes.object,
    middlewares: PropTypes.array,
    enhancers: PropTypes.array,
    preloadedState: PropTypes.any,
    reducers: PropTypes.object,
    production: PropTypes.bool,
  };
  displayName = 'Provider';
  state = {};
  getStore() {
    let { store, preloadedState } = this.props;
    if (!store) {
      const reducers = this.getReducers(this.props);
      const enhancers = this.getEnhancers(this.props);
      store = createStore(reducers, preloadedState, enhancers);
    }
    return store;
  }
  getReducers(props) {
    const { reducers } = props;
    return combineReducers({
      ...reducers,
    });
  }
  getEnhancers(props) {
    const {
      enhancers = [],
      middlewares = [],
      production = true,
    } = props;
    let devtools = () => noop => noop;
    //如果localStorage.reduxTools=true，reduxTools强制打开。
    //给生产环境调试使用。
    if (
      (!production || JSON.parse(localStorage.getItem('reduxDevTools'))) &&
      window.__REDUX_DEVTOOLS_EXTENSION__
    ) {
      devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
    } else {
      console.log('You have not install the redux-devtools-extension.');
      console.log(
        'See https://github.com/zalmoxisus/redux-devtools-extension.'
      );
    }
    const _middlewares = [...middlewares];
    const _enhancers = [
      applyMiddleware(..._middlewares),
      devtools(),
      ...enhancers,
    ];
    return compose(..._enhancers);
  }
  componentWillReceiveProps(nextProps) {
    const { store, hot } = nextProps;
    //热替换处理，根据props.hot来处理
    if (!store && hot) {
      const reducers = this.getReducers(nextProps);
      this.store.replaceReducer(reducers);
    }
  }
  componentWillUnmount() {
    this.store = null;
  }
  render() {
    const { children } = this.props;
    if(!this.store) {
      this.store = this.getStore();
    }
    return <Provider store={this.store}>{children}</Provider>;
  }
}
