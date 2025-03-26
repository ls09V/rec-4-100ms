module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    node: true,
  },
  globals: {
    _webpack_hash_: true,
    gapi: true,
    grecaptcha: true,
    Razorpay: true,
    Hls: true,
    ga: true,
    gtag: true,
    Moengage: true,
    tap: true,
    fbq: true,
  },
  parser: 'babel-eslint',
  rules: {
    'linebreak-style': ['error', 'unix'],
  },
};
