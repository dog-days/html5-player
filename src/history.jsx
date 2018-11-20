import React from 'react';

import Provider from './provider';
import HistorPlayer from './view/history';

export default function(props) {
  return (
    <Provider>
      <HistorPlayer {...props} />
    </Provider>
  );
}
