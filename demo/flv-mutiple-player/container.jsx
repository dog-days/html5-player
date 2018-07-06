import React from 'react';
import Video from './video';
import fetch from '../../src/utils/fetch';

class Container extends React.Component {
  state = {};
  componentDidMount() {
    const allPromise = Promise.all([
      fetch.get(
        '/cloudeye/v1/devices/538447135?client_token=538447135_3356491776_1558061106_cef7bf2d68436a55a831790b5de5a34c'
      ),
      fetch.get(
        'cloudeye/v1/devices/538378420?client_token=538378420_3356491776_1559357316_0194a5d9174507c43a258ee712bb7838'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538444432?client_token=538444432_3356491776_1559357316_b2be239b5fa1006ec27281fe4d927ca3'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538444712?client_token=538444712_3356491776_1559357317_ca1d7e26f040ccef4d89453d22bbf6c3'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538378417?client_token=538378417_3356491776_1559357324_9b8feaf67f2fc89607b5b96c2ca846e9'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538378419?client_token=538378419_3356491776_1559357324_9695b359dec8b6582e2e7f40a6c3dc09'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538378303?client_token=538378303_3356491776_1559357325_04e9f18ddf5f4fe35a011c7c40ca4dff'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538444231?client_token=538444231_3356491776_1559357325_8326d5a3b87471ae3dd8e8945cb0492d'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538443910?client_token=538443910_3356491776_1559357326_68b5e93ecf5578abe3735cc8987e0b90'
      ),
      fetch.get(
        '/cloudeye/v1/devices/538444239?client_token=538444239_3356491776_1559357326_966fa10bf1eb87ea877853cef1225095'
      ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538444485?client_token=538444485_3356491776_1559357327_754c508499e7ed4772dd6e814e617b96'
      // ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538379219?client_token=538379219_3356491776_1559357329_acbb333887a60e376796f7321605872e'
      // ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538444858?client_token=538444858_3356491776_1559357330_66c7aff5e72ee198a1168b86efdc0749'
      // ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538444858?client_token=538444858_3356491776_1559357330_66c7aff5e72ee198a1168b86efdc0749'
      // ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538378357?client_token=538378357_3356491776_1559357617_fae20c0d6c2931b3a6c7c7d39598297e'
      // ),
      // fetch.get(
      //   '/cloudeye/v1/devices/538379224?client_token=538379224_3356491776_1559357618_c369d7d99c7a520e359d4e12f97b0a31'
      // ),
    ]);
    allPromise.then(results => {
      const data = [];
      let i = 0;
      results.forEach((v, k) => {
        if (k % 4 === 0 && k !== 0) {
          i++;
        }
        if (!data[i]) {
          data[i] = [];
        }
        data[i].push(v);
      });
      console.log(data);
      this.setState({
        data,
      });
    });
  }
  render() {
    const { data } = this.state;
    if (!data) {
      return (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            textAlign: 'center',
            width: '100%',
            marginTop: ' -18px',
            fontSize: '18px',
          }}
        >
          加载中...
        </span>
      );
    } else {
      return (
        <div
          className="app"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {data.map((v, k) => {
            return (
              <div
                style={{ display: 'flex', flexDirection: 'row', flex: 1 }}
                key={k}
              >
                {v.map((v2, k2) => {
                  // if (k === 2 && k2 === 1) {
                  //   return <Video file={'http://localhost:8888/'} key={k2} />;
                  // }
                  return <Video file={v2.flv} key={k2} />;
                })}
              </div>
            );
          })}
        </div>
      );
    }
  }
}

export default Container;
