import React from 'react';
import Html5Player from 'html5-player';

export default class View extends React.Component {
  //录像断片处理
  render() {
    return (
      <div className="demo-container">
        <div className="player-container">
          <Html5Player
            timeSliderShowFormat="date"
            file="https://media.w3.org/2010/05/sintel/trailer.mp4"
            fragment={{
              total: {
                begin: '2017-10-03 00:00:00',
                end: '2017-10-03 00:01:19',
              },
              fragments: [
                {
                  begin: '2017-10-03 00:00:02',
                  end: '2017-10-03 00:00:12',
                },
                {
                  begin: '2017-10-03 00:00:32',
                  end: '2017-10-03 00:00:42',
                },
                {
                  begin: '2017-10-03 00:00:45',
                  end: '2017-10-03 00:00:52',
                },
              ],
            }}
          />
        </div>
      </div>
    );
  }
}
