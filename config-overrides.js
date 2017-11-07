const {injectBabelPlugin} = require('react-app-rewired');

// eslint-disable-next-line
module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', {libraryName: 'antd', style: 'css'}],
    config
  );
  return config;
};
