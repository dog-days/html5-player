//外部依赖包
import Controller from 'react-router-controller';

//内部依赖包
import LayoutComponent from 'src/view/layout/main';

export default class MainController extends Controller {
  LayoutComponent = LayoutComponent;
  indexView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  basicView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  //hls使用
  hlsView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  //flv使用
  flvView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  //tracks之字幕使用
  captionView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  //tracks之历史录像断片使用
  historyView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  customView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
  thumbnailView(params) {
    return this.render(
      {
        title: 'Nan Player',
      },
      params
    );
  }
}
