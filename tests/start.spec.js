import React from 'react';
import ReactDOM from 'react-dom';

import { childListChangeObserver } from './util';
import model from './model/unit';
import props from './props/unit';
import props2 from './props-2/unit';
import propsTracks from './props.tracks/unit';
import propsFragment from './props.fragment/unit';

model()
  .then(function({ lastModel, lastDispatch, lastSpyObj }) {
    return new Promise(function(resolve, reject) {
      describe('Model', function() {
        it(`model/video/index "clear" reducer should be executed correctly.`, function(done) {
          const id = 'test';
          childListChangeObserver('#' + id, function() {
            //reload saga已经触发了一次clear。
            expect(lastSpyObj.clear.callCount).to.equal(2);
            resolve();
            done();
          });
          ReactDOM.render(<div />, document.getElementById(id));
        });
      });
    });
  })
  .then(function() {
    return props();
  })
  .then(function() {
    return props2();
  })
  .then(function() {
    return propsTracks();
  })
  .then(function() {
    return propsFragment();
  });
