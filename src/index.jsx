import React from 'react';
import ReactDOM from 'react-dom';
import Player from './player';
import './style';
window.React = React;
window.ReactDOM = ReactDOM;

//兼容preact用法
let root;
/**
 *@param {object} props 播放器配置
 *@param {function} callback 播放器实例化后的回调函数，返回播放器实例
 *                           也可以使用promise获取
 *@return {promise} 播放器实例
 */
function nanPlayer(props, callback) {
  const { id, children, ...other } = props;
  return new Promise(resolve => {
    root = ReactDOM.render(
      <Player
        videoCallback={player => {
          callback && callback(player);
          const remove = player.remove;
          player.remove = function() {
            //如果有定义remove先运行。
            remove && remove();
            root = ReactDOM.render(false, document.getElementById(id), root);
          };
          resolve(player);
        }}
        {...other}
      >
        {children}
      </Player>,
      document.getElementById(id),
      root
    );
  });
}

export default nanPlayer;
