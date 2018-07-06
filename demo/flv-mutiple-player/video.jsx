import React from 'react';
import Player from '../../src';

export default class Video extends React.Component {
  render() {
    return (
      <div style={{ flex: 1, border: '1px solid #fff' }}>
        <Player autoplay {...this.props} />
      </div>
    );
  }
}
