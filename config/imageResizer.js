const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const commonFunctions = require('./commonFunctions');
const config = require('./site.config');

const imagePaths = commonFunctions.list('./src/images/**/*.{jpg,png,webp}', {
  ignore: ['./src/images/resized/**'],
});

const outputPath = path.join(config.root, config.paths.src, 'images/resized');

const resize = (size) => {
  console.log(`Resizing images to ${size}w....`);
  const promises = imagePaths.map((filePath) => {
    return sharp(filePath).metadata()
      .then((meta) => {
        const width = meta.width > size ? size : meta.width;
        return sharp(filePath)
          .resize({
            width,
            fit: 'contain',
          })
          .toFile(path.join(outputPath, `${path.basename(filePath, path.extname(filePath))}-${size}w${path.extname(filePath)}`))
      });
  });
  return Promise.all(promises);
};

const createOutPath = () => {
  if(!fs.existsSync(outputPath)){
    fs.mkdir(outputPath, (err) => {
      if (err) throw err;
    });
  }
};

(() => {
  commonFunctions.clean(['./src/images/resized/*']);
  const confirmation = 'y'
  if(confirmation === 'y'){
   // commonFunctions.clean(['./src/images/resized/*'], {
   //  forced: true,
   // });
   // createOutPath();
   // Promise
   // .all([100, 200, 400, 600, 800, 1000].map(resize))
   // .then(() => {
   //   console.log('Images resized');
   // });
   // lol
   console.log('Task Aborted');
  }
  else{
    console.log('Task Aborted');
    process.exit(1);
  }
})();
