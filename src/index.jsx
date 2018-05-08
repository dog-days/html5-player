//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
//内部依赖包
import Provider from './libs/provider/saga-model-provider';
import modelList from './model-list';
import View from './view';
//icon的js
import './assets/icon/iconfont';

class ModelRegister extends React.Component {
  static contextTypes = {
    sagaStore: PropTypes.object,
  };
  displayName = 'ModelRegister';
  state = {};
  registerModel = register => {
    const allModelPromise = modelList.map(modelId => {
      const model = require(`./model/${modelId}.js`).default;
      return model;
    });
    return Promise.all(allModelPromise).then(models => {
      models.forEach(m => {
        register(m);
      });
    });
  };
  componentDidMount() {
    this.registerModel(this.context.sagaStore.register).then(() => {
      this.setState({
        canBeRendered: true,
      });
    });
  }
  render() {
    const { children } = this.props;
    if (this.state.canBeRendered) {
      return <span>{children}</span>;
    } else {
      return false;
    }
  }
}
export default function player(props) {
  return (
    <Provider
      production={process.env.NODE_ENV === 'production'}
      plugins={[
        {
          onError: (error, dispatch) => {
            console.error(error);
          },
        },
      ]}
    >
      <ModelRegister>
        <View {...props} />
      </ModelRegister>
    </Provider>
  );
}
