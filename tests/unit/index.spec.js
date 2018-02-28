import React from 'react';
import ReactDOM from 'react-dom';
import Player from '../components/player';

// import 'src/style';

var div = document.createElement('div');
div.setAttribute('id', 'test');
document.body.appendChild(div);

ReactDOM.render(
  <Player file="http://videos-f.jwpsrv.com/content/conversions/zWLy8Jer/videos/q1fx20VZ-364766.mp4?token=0_5a963cba_0xec42b37a008ff5f46832a006f9fd0bdad82fed23" />,
  document.getElementById('test')
);
