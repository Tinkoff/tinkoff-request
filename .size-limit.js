const fs = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

const entries = glob.sync('packages/*/package.json')
  .map((packageJson) => {
    const config = fs.readJsonSync(packageJson);
    return `${path.dirname(packageJson)}/${config.main}`;
  });

module.exports = entries.map((entry) => {
  return {
    path: entry,
    ignore: ['@tinkoff/request-*', 'tslib']
  }
});
