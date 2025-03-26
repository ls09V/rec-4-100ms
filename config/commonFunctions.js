const glob = require('glob');
const del = require('del');

const list = (pathPattern, options) => {
  return glob.sync(pathPattern, options);
}

const clean = (paths = [], options = {force: true, dryRun: true}) => {
  const deletedPaths = del.sync(paths, options);
  if (!options.dryRun) {
    console.log(`Cleaned the files ${deletedPaths.join('\n')}`);
  } else {
    console.log(deletedPaths.join('\n'));
  }
};

module.exports = {
  list,
  clean
};
