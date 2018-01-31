//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
//import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
//内部依赖包
import clearDecorator from '../decorator/clear';
import { namespace as trackNamespace } from '../../model/track';
import { namespace as timeNamespace } from '../../model/time';
import { namespace as endNamespace } from '../../model/end';
import { namespace as errorMessageNamespace } from '../../model/error-message';

/**
 * 播放器加载状态的组件
 */
@connect(state => {
  return {
    track: state[trackNamespace],
    time: state[timeNamespace],
    end: state[endNamespace],
    isError: !!state[errorMessageNamespace].message,
  };
})
@clearDecorator([trackNamespace])
export default class Captions extends React.Component {
  static propTypes = {};
  displayName = 'Captions';
  state = {};
  dispatch = this.props.dispatch;
  getData() {
    const { config } = this.props;
    this.dispatch({
      type: `${trackNamespace}/captionsSaga`,
      payload: config,
    });
  }
  componentDidMount() {
    this.getData();
  }
  render() {
    const { track, time, userActive, end, isError } = this.props;
    const { captions } = track;
    const currentTime = time.currentTime;
    if (!captions || isError) {
      return false;
    }
    let text;
    captions.forEach(v => {
      if (currentTime >= v.begin && currentTime < v.end) {
        text = v.text;
      }
    });
    //console.log(text,currentTime)
    if (!text || end) {
      //text为空或者undefined
      return false;
    }
    //回车键需要处理成<br/>
    var textArray = text.split('\r\n');
    if (textArray.length === 1) {
      textArray = text.split('\n');
    }
    return (
      <span
        className={classnames('html5-player-captions-text', {
          'html5-player-captions-text-user-active': userActive,
          'html5-player-captions-text-user-inactive': !userActive,
        })}
      >
        {textArray.map((v, k) => {
          return (
            <span key={k}>
              &nbsp;
              {v}
              &nbsp;
              <br />
            </span>
          );
        })}
      </span>
    );
  }
}
