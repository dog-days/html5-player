//外部依赖包
import React from 'react';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
//内部依赖包

export default class Prev extends React.Component {
  static contextTypes = {
    playlist: PropTypes.array,
    activeItem: PropTypes.number,
    setActiveItem: PropTypes.func,
  };
  displayName = 'Prev';
  onClick = e => {
    this.context.setActiveItem(this.context.activeItem - 1);
  };
  render() {
    const { activeItem, playlist } = this.context;
    if (!playlist || !playlist[0]) {
      return false;
    }
    if (activeItem <= 1) {
      return false;
    }
    return (
      <button
        className="html5-player-small-button float-left html5-player-prev-button"
        onClick={this.onClick}
      >
        <svg
          className={classnames('html5-player-icon html5-player-prev-icon')}
          aria-hidden="true"
        >
          <use xlinkHref="#icon-prev" />
        </svg>
      </button>
    );
  }
}
