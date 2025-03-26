const path = require('path');
const fs = require('fs');

let ROOT = process.env.PWD;

if (!ROOT) {
  ROOT = process.cwd();
}

const config = {
  // Your website's name, used for favicon meta tags
  site_name: 'GUVI',

  // Your website's description, used for favicon meta tags
  site_description: 'Learn to code in your native language',

  // Your website's URL, used for sitemap
  site_url: 'https://www.guvi.in',

  // // Google Analytics tracking ID (leave blank to disable)
  // googleAnalyticsUA: 'UA-53114947-1',

  // // Facebook pixel code
  // facebookPixelId: '',

  // //hotjar site id
  // hotjarSiteId: '',

  // //tag manager - everything inside dont use above
  // tagManagerId: 'GTM-5WRCCN9',

  // The viewport meta tag added to your HTML page's <head> tag
  viewport: 'width=device-width,initial-scale=1,shrink-to-fit=no',

  // Source file for favicon generation. 512x512px recommended.
  favicon: path.join(ROOT, '/src/images/common/favicon.png'),

  // Local development URL
  dev_host: 'localhost',

  // Local development port
  port: process.env.PORT || 8000,

  // Advanced configuration, edit with caution!
  env: process.env.NODE_ENV,
  root: ROOT,
  paths: {
    config: 'config',
    src: 'src',
    dist: 'dist',
  },
  package: JSON.parse(
    fs.readFileSync(path.join(ROOT, '/package.json'), { encoding: 'utf-8' }),
  ),
};

module.exports = config;
