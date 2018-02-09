import React from 'react';
import { render } from 'enzyme';
import sinon from 'sinon';
import Player from '../src/player';

describe('Player Render', function() {
  sinon.stub(console, 'warn');
  it('Player rendered correctly', () => {
    const wrapper = render(
      <Player file="https://media.w3.org/2010/05/sintel/trailer.mp4" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
