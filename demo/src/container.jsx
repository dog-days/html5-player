import React from 'react';
import Controller, { MemoryRouterController } from 'react-router-controller';

Controller.set({
  readViewFile(viewId, controllerId, firstLoad) {
    //view可以异步载入
    return import(/* webpackMode: "eager" */
    `./view/${controllerId}/${viewId}/index.jsx`).then(component => {
      return component.default;
    });
  },
  readControllerFile(controllerId) {
    //webpackMode: eager是使import变为不异步，跟require一样，
    //但是返回的时promise对象，不能使用require，require会把没必要的文件载入
    //最好不使用异步载入，可能导致一些问题
    return import(/* webpackMode: "eager" */
    `./controller/${controllerId}.js`)
      .then(controller => {
        return controller.default;
      })
      .catch(e => {
        //必须catch并返回false
        return false;
      });
  },
  //设置首页path（跳转路径，即react-router path='/'时，会跳转到indexPath）
  //第一个字符必须是'/'，不能是main/index，要是绝对的路径
  indexPath: () => {
    return '/main/basic';
  },
});

export default function container(props) {
  //basename的设置需要配合webpack使用，要不即使在开发环境没问题，但是成产环境
  //访问根目录的basename文件夹（文件名为basename的值），会有问题的。
  return (
    <MemoryRouterController basename={process.env.basename} hot={props.hot} />
  );
}
