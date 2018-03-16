//外部依赖包
import Controller from 'react-router-controller';

//内部依赖包
import LayoutComponent from 'src/view/layout/main';
const title = 'Html5 Player';

export default class MainController extends Controller {
  LayoutComponent = LayoutComponent;
  indexView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  basicView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  //hls使用
  hlsView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  //flv使用
  flvView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  //tracks之字幕使用
  subtitleView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  //tracks之历史录像断片使用
  fragmentView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  customView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
  thumbnailView(params) {
    return this.render(
      {
        title,
      },
      params
    );
  }
}
