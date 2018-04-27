//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import classnames from 'classnames';
//内部依赖包
import clearDecorator from './decorator/clear';
import { namespace as fragmentNamespace } from '../model/fragment';
/**
 * fragment是video断片处理
 * 合成录像，摄像头上传视频会中断，会分成几个视频，然后这几个视频会合并成一个视频
 * 但是这个视频不是整个时段的，会有断的，为了给用户知道这段录像哪里断了，需要而外处理
 */
@connect(state => {
  return {};
})
@clearDecorator([fragmentNamespace])
export default class Fragment extends React.Component {
  static propTypes = {
    //现在支持传对象进来
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  };
  displayName = 'Fragment';
  dispatch = this.props.dispatch;
  getData() {
    const { url } = this.props;
    this.dispatch({
      type: `${fragmentNamespace}/fragmentSaga`,
      payload: url,
    });
  }
  componentDidMount() {
    this.getData();
  }
  render() {
    return false;
  }
}
