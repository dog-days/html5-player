function clearDecorator(modelNamespaceArr) {
  return component => {
    component.prototype.temp_componentWillUnmount =
      component.prototype.componentWillUnmount;
    component.prototype.componentWillUnmount = function() {
      if (!this.props.dispatch) {
        console.error(new Error('props缺少redux的dispatch'));
        return;
      }
      this.temp_componentWillUnmount && this.temp_componentWillUnmount();
      modelNamespaceArr.forEach(v => {
        this.props.dispatch({
          type: `${v}/clear`,
          payload: {},
        });
      });
    };
    return component;
  };
}
export default clearDecorator;
