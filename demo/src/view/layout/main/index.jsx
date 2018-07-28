import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import 'src/style/css/bootstrap.css';
import 'src/style/css/layout-main.less';

class MainLayout extends React.Component {
  renderItem(title, viewId) {
    const { params } = this.props;
    return (
      <li
        className={classnames({
          active: params.viewId === viewId,
        })}
      >
        <Link to={`/main/${viewId}`}>{title}</Link>
      </li>
    );
  }
  render() {
    const { children, params } = this.props;
    const codeUrl = `https://github.com/dog-days/html5-player/tree/master/demo/src/view/${
      params.controllerId
    }/${params.viewId}/index.jsx`;
    return (
      <div className="layout-container">
        <nav className="navbar navbar-inverse">
          <div className="navbar-header">
            <ul className="nav navbar-nav">
              {this.renderItem('基本使用', 'basic')}
              {this.renderItem('hls使用', 'hls')}
              {this.renderItem('flv使用', 'flv')}
              {this.renderItem('字幕使用', 'subtitle')}
              {this.renderItem('缩略图使用', 'thumbnail')}
              {this.renderItem('视频断片使用', 'fragment')}
              {this.renderItem('自定义', 'custom')}
              {this.renderItem('地图', 'map')}
              {this.renderItem('播放列表', 'playlist')}
              {this.renderItem('历史回放', 'history')}
            </ul>
          </div>
        </nav>
        <div className="main-contents">
          <div className="code-url-container">
            <span>源码位置：</span>
            <a href={codeUrl} target="_blank">
              {codeUrl}
            </a>
          </div>
          {children}
        </div>
      </div>
    );
  }
}

export default MainLayout;
