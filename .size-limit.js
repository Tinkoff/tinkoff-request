const fs = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

const entries = glob.sync('packages/*/package.json')
  .map((packageJson) => {
    const config = fs.readJsonSync(packageJson);
    let modulePath = config.module;

    if (config.browser) {
      if (typeof config.browser === 'object') {
        modulePath = config.browser[`./${modulePath}`] ?? modulePath;
      } else {
        modulePath = config.browser;
      }
    }

    return { name: config.name, path: path.resolve(path.dirname(packageJson), modulePath) };
  });


module.exports = entries.map((entry) => {
  return {
    name: entry.name,
    path: entry.path,
    ignore: ['@tinkoff/request-*', 'tslib']
  }
});
