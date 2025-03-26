const webpack = require('webpack');
const cssnano = require('cssnano');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const commonFunctions = require('./commonFunctions');

const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
// const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin');
const SitemapWebpackPlugin = require('sitemap-webpack-plugin').default;
const Dotenv = require('dotenv-webpack');
const CreateFileWebpack = require('create-file-webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');
const prettier = require('prettier');



const config = require('./site.config');

// Hot module replacement
const hmr = new webpack.HotModuleReplacementPlugin();

// Optimize CSS assets
// const optimizeCss = new OptimizeCssAssetsPlugin({
//   assetNameRegExp: /\.css$/g,
//   cssProcessor: cssnano,
//   cssProcessorPluginOptions: {
//     preset: [
//       'default',
//       {
//         discardComments: {
//           removeAll: true,
//         },
//       },
//     ],
//   },
//   canPrint: true,
// });

const cssminimizerplugin =  new CssMinimizerPlugin();

// Generate robots.txt
const robots = new RobotstxtPlugin({
  sitemap: `${config.site_url}/sitemap.xml`,
  host: config.site_url,
});

// Clean webpack
const clean = new CleanWebpackPlugin();

// Stylelint
const stylelint = new StyleLintPlugin({
  files: '**/*.scss'
});

// Extract CSS
const cssExtract = new MiniCssExtractPlugin({
  filename: 'build/[name].[contenthash].css',
  chunkFilename: 'build/[id].[name].[contenthash].css'
});

const hintResource = new ResourceHintWebpackPlugin();

// HTML generation
const paths = [];
const ignoredPaths = [
  "clubs.html",
  "eventDay.html",
  "profile.html",
  "profile-edit.html",
  "turtle-createChallenge.html",
  "turtle-share.html",
  "turtle-shareChallenge.html"
];
const generateHTMLPlugins = () => {
  const htmlFilePaths = commonFunctions.list('./src/*.html');
  return htmlFilePaths.map((filePath) => {
    let filename = filePath.substring(6);
    if (!ignoredPaths.includes(filename)) {
      paths.push(filename);
    }
    return new HTMLWebpackPlugin({
      filename,
      template: path.join(config.root, config.paths.src, filename),
      meta: {
        viewport: config.viewport,
      },
      minify: true,
      chunks: [filename.slice(0, -5)]
    });
  });
};


// Beautify HTML
// const beautify = new HtmlBeautifyPlugin();

// Sitemap
const sitemap = new SitemapWebpackPlugin({
  base: config.site_url, // Your website base URL
  paths: paths,
  options: {
    priority: 1.0,
    lastmod: true,
    lastmodrealtime: true,
    changefreq: 'weekly',
  },
});

// Favicons
const favicons = new FaviconsWebpackPlugin({
  logo: config.favicon,
  prefix: 'build/images/favicons/',
  favicons: {
    appName: config.site_name,
    appDescription: config.site_description,
    developerName: null,
    developerURL: null,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      windows: false,
      yandex: false,
    },
  },
});

// CopyPlugin
// To copy images that are not used through CSS, but directly on HTML as IMG src
const copier = new CopyPlugin({
  patterns: [
    {
      from: '../src/images/**',
      to: './build/',
    },
  ],
});

// Webpack bar
const webpackBar = new WebpackBar({
  color: '#ff6469',
});

// Google analytics
const CODE = `<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create','{{ID}}','auto');ga('send','pageview');</script>`;

class GoogleAnalyticsPlugin {
  constructor({ id }) {
    this.id = id;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('GoogleAnalyticsPlugin', (compilation) => {
      HTMLWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'GoogleAnalyticsPlugin',
        (data, cb) => {
          data.html = data.html.replace('</head>', `${CODE.replace('{{ID}}', this.id) }</head>`);
          cb(null, data);
        },
      );
    });
  }
}

const google = new GoogleAnalyticsPlugin({
  id: config.googleAnalyticsUA,
});

// Facebook pixel
const pixelCode = `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '{{ID}}');fbq('track', 'PageView');</script><noscript> <img height="1" width="1"src="https://www.facebook.com/tr?id={{ID}}&ev=PageView&noscript=1"/></noscript>`;

class FacebookPixelPlugin {
  constructor({ id }) {
    this.id = id;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('FacebookPixelPlugin', (compilation) => {
      HTMLWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'FacebookPixelPlugin',
        (data, cb) => {
          data.html = data.html.replace('</head>', `${pixelCode.replace(/{{ID}}/g, this.id)}</head>`);
          cb(null, data);
        },
      );
    });
  }
}

const facebook = new FacebookPixelPlugin({
  id: config.facebookPixelId,
});

// hotjar tracking code
const hotjarCode = `<script>(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:{{ID}},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');</script>`;

const hotjarApplicablePages = ['block-coding-olympiad.html'];

class hotjarTrackingPlugin {
  constructor({ id }) {
    this.id = id;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('hotjarTrackingPlugin', (compilation) => {
      HTMLWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'hotjarTrackingPlugin',
        (data, cb) => {
          if (hotjarApplicablePages.includes(data.outputName)) {
            data.html = data.html.replace('</head>', `${hotjarCode.replace(/{{ID}}/g, this.id)}</head>`);
          }
          cb(null, data);
        },
      );
    });
  }
}

const hotjar = new hotjarTrackingPlugin({
  id: config.hotjarSiteId,
});

// google tag manager(everything in one)
const tagManagerHead = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','{{ID}}');</script>`;

const tagManagerBody = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ID}}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

class tagManagerPlugin {
  constructor({ id }) {
    this.id = id;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('tagManagerPlugin', (compilation) => {
      HTMLWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'tagManagerPlugin',
        (data, cb) => {
          data.html = data.html.replace('</head>', `${tagManagerHead.replace(/{{ID}}/g, this.id)}</head>`);
          data.html = data.html.replace('<body>', `<body>${tagManagerBody.replace(/{{ID}}/g, this.id)}`);
          cb(null, data);
        },
      );
    });
  }
}

const tagManager = new tagManagerPlugin({
  id: config.tagManagerId,
});

const env = new Dotenv({
  path: path.join(config.root, 'env', process.env.VARIANT, '.env'),
});

const htaccess = `
# Protect files and directories from prying eyes.

# Don't show directory listings for URLs which map to a directory.
Options -Indexes
# Follow symbolic links in this directory.
Options +FollowSymlinks -MultiViews
# Set the default handler.
DirectoryIndex index.html index.htm index.php
#DirectoryIndex welcome.html
RewriteEngine On

# single courses page start
RewriteRule ^courses/(.*) /courses-landing.html [NC,L]
# single courses page end

# pricing page start
RewriteRule ^pricing/(.*) /pricing.html [NC,L]
# pricing page end

# referral page start
RewriteRule ^referral/(.*) /referral.html [NC,L]
# referral page end

# courses-video page start
RewriteRule ^courses-video/(.*) /courses-video.html [NC,L]
# courses-video page end

# to make '/path/index.html' to /path/
RewriteCond %{THE_REQUEST} ^GET\\s(.*/)index\\.html [NC]
RewriteRule . %1 [NE,R=301,L]
RewriteCond %{THE_REQUEST} ^GET\\s.+\\.html [NC]
RewriteRule ^(.+)\\.html$ /$1 [NE,R=301,L,NC]
RewriteCond %{REQUEST_URI} !\\.html$ [NC]
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule . %{REQUEST_URI}.html [L]

#Redirect /dl /deep-learning.html
#Redirect /zen https://niyas416567.typeform.com/to/asfVPu
#Redirect /intern https://goo.gl/forms/7BRYG3ZL9INitS6V2
Redirect /app https://play.google.com/store/apps/details?id=com.guviGK
Redirect /login /sign-in.html
Redirect /about_us /story.html
Redirect /festiveoffer /ml-pack.html
Redirect /festiveoffer.html /ml-pack.html
Redirect /PublicPlaylists.html /courses.html
Redirect /pmcourse.html /pmCourse.html
Redirect /webathon https://lp.guvi.in/webathon

Redirect /pmcourse /pmCourse
Redirect /careerpack /courses
#ErrorDocument 404 http://guvi.in/404.html
<IfModule mod_rewrite.c>
RewriteEngine On
# No rewriting will be done here if the file exists
RewriteCond %{REQUEST_URI} !/(serviceworker)\\.js [NC]
RewriteCond %REQUEST_FILENAME !-f
RewriteCond %REQUEST_FILENAME !-d
RewriteRule ^([a-zA-Z0-9]+[\\W\\w])?(.[a-zA-Z0-9])$ profile.html?user=$1
Redirect /survey https://forms.gle/M6rrZRWo1L1TV3h46
RewriteRule ^tamil_bundle$ bundle-pages.html?course=tamil_bundle [NC,L,QSA]
Redirect /hdl /deep-learning.html?utm_source=Connection&utm_medium=Physical&utm_campaign=Guvi-DL-Course-KP-HU
Redirect /HDL /deep-learning.html?utm_source=Connection&utm_medium=Physical&utm_campaign=Guvi-DL-Course-KP-HU
Redirect /dl /deep-learning.html
Redirect /DL /deep-learning.html
Redirect /dL /deep-learning.html
Redirect /Dl /deep-learning.html
Redirect /dlrv /deep-learning.html?utm_source=Youtube&utm_medium=LinkClick&utm_campaign=GUVI-DL-RV-video
Redirect /DLRV /deep-learning.html?utm_source=Youtube&utm_medium=LinkClick&utm_campaign=GUVI-DL-RV-video
Redirect /dlrp /deep-learning.html?utm_source=Facebook&utm_medium=LinkClick&utm_campaign=GUVI-DL-FB-RealPython
Redirect /DLRP /deep-learning.html?utm_source=Facebook&utm_medium=LinkClick&utm_campaign=GUVI-DL-FB-RealPython
Redirect /dlpp /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-FBPost-PythonProgramming
Redirect /DLPP /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-FBPost-PythonProgramming
Redirect /dlp /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-FBPost-PurePython
Redirect /DLP /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-FBPost-PurePython
Redirect /dla /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-AI
Redirect /DLA /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-AI
Redirect /ldl /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-LML
Redirect /LDL /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-LML
Redirect /kdl /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-SIT
Redirect /KDL /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-SIT
Redirect /dlg /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-DLG
Redirect /DLG /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-DLG
Redirect /pdl /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-Pycoders
Redirect /PDL /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-Pycoders
Redirect /dlpb /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-ProgrammingBlog
Redirect /DLPB /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-ProgrammingBlog
Redirect /dlk /deep-learning.html?utm_source=WhatsApp&utm_medium=Message&utm_campaign=Guvi-DL-Course-WA-unnamedAudience
Redirect /DLK /deep-learning.html?utm_source=WhatsApp&utm_medium=Message&utm_campaign=Guvi-DL-Course-WA-unnamedAudience
Redirect /dls /deep-learning.html?utm_source=Physical&utm_medium=Standee&utm_campaign=Guvi-DL-Course-SD-SRM
Redirect /DLS /deep-learning.html?utm_source=Physical&utm_medium=Standee&utm_campaign=Guvi-DL-Course-SD-SRM
Redirect /dlm /deep-learning.html?utm_source=SMS&utm_medium=Message&utm_campaign=Guvi-DL-Course-SMS-YOG1
Redirect /DLM /deep-learning.html?utm_source=SMS&utm_medium=Message&utm_campaign=Guvi-DL-Course-SMS-YOG1
Redirect /dlvit /deep-learning.html?utm_source=VIT&utm_medium=VIT&utm_campaign=VIT-DL
Redirect /DLVIT /deep-learning.html?utm_source=VIT&utm_medium=VIT&utm_campaign=VIT-DL
Redirect /mlvit /ml-pack.html?utm_source=VIT&utm_medium=VIT&utm_campaign=VIT-ML
Redirect /MLVIT /ml-pack.html?utm_source=VIT&utm_medium=VIT&utm_campaign=VIT-ML
Redirect /dlcs /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-CSL
Redirect /DLCS /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-CSL
Redirect /dlpc /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PC
Redirect /DLPC /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PC
Redirect /dlai /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-AIHUB
Redirect /DLAI /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-AIHUB
Redirect /dlmc /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-MC
Redirect /DLMC /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-MC
Redirect /dlpl /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PL
Redirect /DLPL /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PL
Redirect /dlds /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-DS
Redirect /DLDS /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-DS
Redirect /dlpp /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PP
Redirect /DLPP /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-PP
Redirect /dlnc /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-NC
Redirect /DLNC /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-NC
Redirect /dlkp /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-KP
Redirect /DLKP /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-KP
Redirect /dlch /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-CH
Redirect /DLCH /deep-learning.html?utm_source=Facebook&utm_medium=PagePost&utm_campaign=Guvi-DL-Course-IGPost-CH

Redirect /dlc /deep-learning?utm_source=Facebook&utm_medium=CPC&utm_campaign=GUVI-DL-Course-LookALike-Audience
Redirect /DLC /deep-learning?utm_source=Facebook&utm_medium=CPC&utm_campaign=GUVI-DL-Course-LookALike-Audience

Redirect /dpl /deep-learning?utm_source=Physical&utm_medium=Ref&utm_campaign=AN
Redirect /DPL /deep-learning?utm_source=Physical&utm_medium=Ref&utm_campaign=AN
#Redirect /festiveoffer /careerpack.html
Redirect /blogs https://blog.guvi.in
Redirect /intern /current-openings
Redirect /lp-data-science-pack /data-science-pack
Redirect /anniversary-offer /premium-pass
Redirect /zen /full-stack-development-course-with-javascript-ZenClass
Redirect /zenclass /full-stack-development-course-with-javascript-ZenClass
Redirect /ZENCLASS /full-stack-development-course-with-javascript-ZenClass
Redirect /web-development-course-bundle-with-online-certification https://lp.guvi.in/web-development-course-bundle-with-online-certification
Redirect /web-dev https://lp.guvi.in/web-development-course-bundle-with-online-certification?utm_source=insta&utm_medium=post&utm_campaign=shoutout
Redirect /youth-treat https://lp.guvi.in/youth-treat
Redirect /rpa https://lp.guvi.in/rpa
Redirect /uipath-training https://lp.guvi.in/rpa
<Ifmodule mod_rewrite.c>
RewriteEngine On
# No rewriting will be done here if the file exists
RewriteCond %{REQUEST_URI} g.uvi
#check whether the request url contains g.uvi flag
RewriteRule .* interview_instruction.html
#if the flag check is true then redirect to interview_instruction.html page

#</IfModule>

# ----------------------------------------------------------------------
# Expires headers (for better cache control)
# ----------------------------------------------------------------------

#
# These are pretty far-future expires headers
# They assume you control versioning with cachebusting query params like:
#   <script src="application.js?20100608">
# Additionally, consider that outdated proxies may miscache
#
#   www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/

#
# If you dont use filenames to version, lower the css and js to something like "access plus 1 week"
#

#<IfModule mod_expires.c>
 # ExpiresActive on

# Perhaps better to whitelist expires rules? Perhaps.
#  ExpiresDefault                          "access plus 0 seconds"

# cache.appcache needs re-requests in FF 3.6 (thx Remy ~Introducing HTML5)
#  ExpiresByType text/cache-manifest       "access plus 0 seconds"



# Your document html
#  ExpiresByType text/html                 "access plus 0 seconds"

# Data
#  ExpiresByType text/xml                  "access plus 0 seconds"
#  ExpiresByType application/xml           "access plus 0 seconds"
#  ExpiresByType application/json          "access plus 0 seconds"

# RSS feed
#  ExpiresByType application/rss+xml       "access plus 1 hour"

# Favicon (cannot be renamed)
# ExpiresByType image/x-icon              "access plus 1 week"

# Media: images, video, audio
# ExpiresByType image/gif                 "access plus 1 month"
#  ExpiresByType image/png                 "access plus 1 month"
#  ExpiresByType image/jpg                 "access plus 1 month"
#  ExpiresByType image/jpeg                "access plus 1 month"
#  ExpiresByType video/ogg                 "access plus 1 month"
#  ExpiresByType audio/ogg                 "access plus 1 month"
#  ExpiresByType video/mp4                 "access plus 1 month"
#  ExpiresByType video/webm                "access plus 1 month"

# HTC files  (css3pie)
# ExpiresByType text/x-component          "access plus 1 month"

# Webfonts
#  ExpiresByType font/truetype             "access plus 0 month"
#  ExpiresByType font/opentype             "access plus 0 month"
#  ExpiresByType application/x-font-woff   "access plus 0 month"
#  ExpiresByType image/svg+xml             "access plus 0 month"
#  ExpiresByType application/vnd.ms-fontobject "access plus 0 month"

# CSS and JavaScript
# ExpiresByType text/css                  "access plus 0 year"
# ExpiresByType application/javascript    "access plus 0 year"
# ExpiresByType text/javascript           "access plus 0 year"

  <IfModule mod_headers.c>
    Header append Cache-Control "public"
    Header always set X-Frame-Options "SAMEORIGIN"
  </IfModule>


</IfModule>

`;

const createHtaccess = new CreateFileWebpack({
  path: './dist',
  fileName: '.htaccess',
  content: htaccess,
});

const bundleAnalyser = new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  reportFilename: 'bundler-report.html',
});

// const hashProvider = new webpack.ExtendedAPIPlugin();

module.exports = [
  cssminimizerplugin, 
  clean,
  stylelint,
  cssExtract,
  ...generateHTMLPlugins(),
  hintResource,
  fs.existsSync(config.favicon) && favicons,
  copier,
  // config.env === 'production' && optimizeCss,
  // config.env === 'production' && robots,
  // config.env === 'production' && sitemap,
  //config.env === 'production' && config.googleAnalyticsUA && google,
  // config.env === 'production' && config.facebookPixelId && facebook,
  // config.env === 'production' && config.hotjarSiteId && hotjar,
  //config.env === 'production' && config.tagManagerId && tagManager,
  webpackBar,
  config.env === 'development' && hmr,
  // config.env === 'production' && hashProvider,
  env,
  createHtaccess,
  config.env === 'production' && process.env.VARIANT === 'local' && bundleAnalyser,
].filter(Boolean);
