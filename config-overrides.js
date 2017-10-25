const {injectBabelPlugin} = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const lessToJs = require('less-vars-to-js');
const path = require('path');
const fs = require('fs');

const themeVariables = lessToJs(
  fs.readFileSync(path.join(__dirname, './src/photon-ant.less'), 'utf8'),
);

// eslint-disable-next-line
module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', {libraryName: 'antd', style: true}],
    config,
  );
  config = rewireLess(config, env, {
    modifyVars: themeVariables,
  });
  return config;
};
