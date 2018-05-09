import React from 'react';
import ReactDOM from 'react-dom';

import * as storage from 'src/utils/storage';
import { childListChangeObserver } from './util';
import model from './model/unit';
import props from './props/unit';
import props2 from './props-2/unit';
import propsTracks from './props.tracks/unit';
import propsFragmentString from './props.fragment-string/unit';
import propsFragmentObject from './props.fragment-object/unit';
import propsContextMenuFalse from './props.contextMenu-false/unit';
import propsContextMenuElement from './props.contextMenu-element/unit';
import propsLogoString from './props.logo-string/unit';
import propsLogoElement from './props.logo-element/unit';
import propsPlaylist from './playlist/unit';
import events from './events/unit';

const id = 'test';
const div = document.createElement('div');
div.setAttribute('id', id);
document.body.appendChild(div);

model(id)
  .then(function({ lastModel, lastDispatch, lastSpyObj }) {
    return new Promise(function(resolve, reject) {
      describe('Model', function() {
        it(`model/video/index "clear" reducer should be executed correctly.`, function(done) {
          //删除播放器
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
    return props(id);
  })
  .then(function() {
    return props2(id);
  })
  .then(function() {
    return propsTracks(id);
  })
  .then(function() {
    return propsFragmentString(id);
  })
  .then(function() {
    return propsFragmentObject(id);
  })
  .then(function() {
    return propsContextMenuFalse(id);
  })
  .then(function() {
    return propsContextMenuElement(id);
  })
  .then(function() {
    return propsLogoString(id);
  })
  .then(function() {
    return propsLogoElement(id);
  })
  .then(function() {
    return propsPlaylist(id);
  })
  .then(function() {
    storage.set('muted', false);
    storage.set('volume', 20);
    return events(id);
  });
