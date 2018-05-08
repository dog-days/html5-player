//外部依赖包
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
//import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
//内部依赖包
// import addEventListener from '../../utils/dom/addEventListener';
import { cloneElement, getChildProps } from '../../utils/util';

const defaultGap = 10;
const defaultShowScrollCount = 4;

export default class Carousel extends React.Component {
  static propTypes = {
    //图片直接的间距
    gap: PropTypes.number,
    //默认可见局域，展示的图片个数
    defaultShowScrollCount: PropTypes.number,
    //当前激活的item
    activeItem: PropTypes.number,
  };
  displayName = 'Carousel';
  state = {
    innerContainerLeft: 0,
  };
  componentDidMount() {
    const { children } = this.props;
    if (!children) {
      return;
    }
    const containerDOM = ReactDOM.findDOMNode(this.refs['carousel-container']);
    this.containerInnerDOM = ReactDOM.findDOMNode(
      this.refs['carousel-inner-container']
    );
    this.carouselWidth = containerDOM.clientWidth;
    this.setState({
      carouselWidth: containerDOM.clientWidth,
    });
  }
  componentWillReceiveProps(nextProps) {
    const {
      showScrollCount = defaultShowScrollCount,
      children = [],
    } = this.props;
    if (
      nextProps.activeItem <= children.length &&
      nextProps.activeItem !== this.props.activeItem
    ) {
      this.scrollCount = Math.ceil(nextProps.activeItem / showScrollCount) - 1;
    }
  }
  //记录向左向右滚动的次数，左减一，右加一。
  scrollCount = 0;
  get maxScrollCount() {
    const {
      showScrollCount = defaultShowScrollCount,
      children = [],
    } = this.props;
    return Math.ceil(children.length / showScrollCount) - 1;
  }
  get innerContainerLeft() {
    const {
      gap = defaultGap,
      children = [],
      showScrollCount = defaultShowScrollCount,
    } = this.props;
    const remainder = children.length % showScrollCount;
    let left = -(this.carouselWidth + gap) * this.scrollCount;
    if (
      this.maxScrollCount !== 0 &&
      this.maxScrollCount === this.scrollCount &&
      remainder !== 0
    ) {
      left =
        -(this.carouselWidth + gap) * (this.maxScrollCount - 1) -
        remainder / showScrollCount * this.carouselWidth -
        gap;
    }
    return left;
  }
  arrowRightClick = e => {
    e.stopPropagation();
    if (this.scrollCount >= this.maxScrollCount) {
      //右边最大。
      return;
    }
    this.scrollCount++;
    this.setState({
      //触发更新，这里的状态数据，不使用
      innerContainerLeft: this.innerContainerLeft,
    });
  };
  arrowLeftClick = e => {
    e.stopPropagation();
    if (this.scrollCount <= 0) {
      //左边到尽头了
      return;
    }
    this.scrollCount--;
    this.setState({
      //触发更新，这里的状态数据，不使用
      innerContainerLeft: this.innerContainerLeft,
    });
  };
  render() {
    const {
      className,
      gap = defaultGap,
      showScrollCount = defaultShowScrollCount,
      children = [],
      activeItem,
    } = this.props;
    if (!children[0]) {
      return false;
    }
    const percent = 1 / showScrollCount;
    const { carouselWidth } = this.state;
    const arrowLeftDisable = this.scrollCount === 0;
    const arrowRightDisable = this.scrollCount >= this.maxScrollCount;
    return (
      <div className="relative">
        <div
          className="html5-player-carousel-arrow-left"
          onClick={this.arrowLeftClick}
        >
          <svg
            className={classnames(
              'html5-player-icon html5-player-arrow-left-icon',
              {
                'html5-player-icon-disable': arrowLeftDisable,
              }
            )}
            aria-hidden="true"
          >
            <use xlinkHref="#icon-arrow-left" />
          </svg>
        </div>
        <div
          className={classnames('html5-player-carousel', className)}
          ref="carousel-container"
        >
          {carouselWidth && (
            <div
              className="html5-player-carousel-inner-contianer html5-player-carousel-transition"
              ref="carousel-inner-container"
              style={{ left: this.innerContainerLeft }}
            >
              {children &&
                children.map((v, k) => {
                  let marginLeft = `${gap}px`;
                  if (k === 0) {
                    marginLeft = 0;
                  }
                  //container宽度 - 间距
                  const itemWidth =
                    carouselWidth * percent - gap + gap * percent;
                  const childProps = getChildProps(v);
                  return cloneElement(
                    v,
                    {
                      style: {
                        width: `${itemWidth}px`,
                        marginLeft,
                      },
                      className: classnames(
                        'html5-player-carousel-item',
                        childProps.className,
                        {
                          'html5-player-carousel-item-active':
                            k + 1 === activeItem,
                        }
                      ),
                      key: k,
                    },
                    null
                  );
                })}
            </div>
          )}
        </div>
        <div
          className="html5-player-carousel-arrow-right"
          onClick={this.arrowRightClick}
        >
          <svg
            className={classnames(
              'html5-player-icon html5-player-arrow-left-icon',
              {
                'html5-player-icon-disable': arrowRightDisable,
              }
            )}
            aria-hidden="true"
          >
            <use xlinkHref="#icon-arrow-right" />
          </svg>
        </div>
      </div>
    );
  }
}
