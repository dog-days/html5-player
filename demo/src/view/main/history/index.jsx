import React from 'react';
import NanPlayer from 'nan-player';

export default class View extends React.Component {
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <NanPlayer
            timeSliderShowFormat="date"
            file="https://media.w3.org/2010/05/sintel/trailer.mp4"
            fragment={`${process.env.basename}/fragment.json`}
          />
        </div>
      </div>
    );
  }
}
