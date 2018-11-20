//外部依赖包
import React from 'react';
//内部依赖包
import Provider from './provider';
import View from './view';

export default function player(props) {
  return (
    <Provider>
      <View {...props} />
    </Provider>
  );
}
