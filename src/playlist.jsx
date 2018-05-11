//外部依赖包
import React from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';
//内部依赖包
import Player from './index';
import Carousel from './view/components/carousel';

export default class Playlist extends React.Component {
  static propTypes = {
    playlist: PropTypes.array.isRequired,
    //当前选择播放的视频源（播放列表中的某项）
    activeItem: PropTypes.number,
    //视频走定时轮播，没有默认值
    //可以使毫秒设置轮播间隔
    videoCarousel: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  };
  static childContextTypes = {
    playlist: PropTypes.array,
    activeItem: PropTypes.number,
    setActiveItem: PropTypes.func,
  };
  getChildContext() {
    return {
      playlist: this.props.playlist,
      activeItem: this.activeItem,
      setActiveItem: this.setActiveItem,
    };
  }
  displayName = 'Playlist';
  state = {
    activeItem: this.props.activeItem,
  };
  componentDidMount() {
    this.setVideoSwitchInterval();
  }
  componentWillUnmount() {
    clearInterval(this.clearInterval);
    this.clearInterval = null;
  }
  setVideoSwitchInterval = () => {
    const { playlist, videoCarousel } = this.props;
    if (videoCarousel) {
      clearInterval(this.clearInterval);
      let time = 1000 * 10;
      if (!isNaN(+JSON.stringify(videoCarousel))) {
        time = videoCarousel;
      }
      this.clearInterval = setInterval(() => {
        if (this.activeItem >= playlist.length) {
          this.activeItem = 1;
        } else {
          this.activeItem = this.activeItem + 1;
        }
      }, time);
    }
  };
  get activeItem() {
    return this.state.activeItem;
  }
  set activeItem(value) {
    this.setState({ activeItem: value });
  }
  setActiveItem = value => {
    this.activeItem = value;
  };
  onPlaylistItemClick = index => {
    return e => {
      this.setVideoSwitchInterval();
      this.setState({ activeItem: index + 1 });
    };
  };
  render() {
    const { title, gap, showCount, playlist = [], ...other } = this.props;
    const { activeItem } = this.state;
    const playerProps = {
      ...other,
      ...playlist[activeItem - 1],
      activeItem,
      title: (
        <span>
          {playlist[activeItem - 1].title}
          {title}
        </span>
      ),
    };
    return (
      <span>
        <Player {...playerProps} playlist={playlist} />
        {playlist[0] && (
          <div className="html5-player-playlist-container">
            <Carousel
              className="html5-player-list"
              gap={gap}
              showCount={showCount}
              activeItem={activeItem}
            >
              {playlist &&
                playlist.map((v, k) => {
                  return (
                    <div key={k} onClick={this.onPlaylistItemClick(k)}>
                      <div className="html5-player-carousel-item-cover">
                        {React.isValidElement(v.cover) && v.cover}
                        {isString(v.cover) && <img alt="" src={v.cover} />}
                      </div>
                      <div className="html5-player-carousel-item-title">
                        {v.title}
                      </div>
                    </div>
                  );
                })}
            </Carousel>
          </div>
        )}
      </span>
    );
  }
}
