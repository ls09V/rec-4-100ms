module.exports = {
  "extends": "stylelint-config-standard",
  "ignoreFiles": [
    "src/stylesheets/vendor/font-awesome/scss/**/*.scss"
  ],
  "plugins": ["stylelint-scss"],
  "rules": {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    "no-descending-specificity": null,
    "selector-pseudo-element-colon-notation": "single",
  },
}
