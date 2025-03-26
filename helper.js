const del = require('del');
const fs = require("fs");
// const readlineSync = require('readline-sync');
const copy = require('copy');

const distPath = 'dist';

const destPath = '../guvi3.0-dev';

const exitError = () => {
  process.exit(1);
};

const clean = (paths = [], options = { force: true, dryRun: true } ) => {
  const deletedPaths = del.sync(paths, options);
  return deletedPaths;
};

const getConfirmation = () => {
  // const confirmation = readlineSync.question('The above list of files will be deleted. Are you sure want to continue? (y/n):');
  const confirmation = 'y'
  return confirmation
};

const copyFiles = (fromPath, toPath) => new Promise((resolve, reject) => {
  copy(fromPath, toPath, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  });
});

const init = () => {
  const scopedPaths = [
    `${destPath}/*`,
    `${destPath}/.htaccess`,
    `!${destPath}/.git`,
    `!${destPath}/.gitignore`,
  ];
  const matchedPaths = clean(scopedPaths);
  console.log('Files and directories that would be deleted:\n', matchedPaths.join('\n'));
  const action = getConfirmation();
  if(action === 'y'){
    console.log("No turning back now");
    clean(scopedPaths, { force: true });
    copyFiles(`${distPath}/**/*`, destPath).then(() => {
      console.log(`Copied files from ${distPath} to ${destPath} successfully`);
    }).catch((err) => {
      console.error(err);
    });
  }
  else{
    console.error('Task aborted');
    exitError();
  }
};

init();
