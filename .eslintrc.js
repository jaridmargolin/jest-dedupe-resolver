'use strict'

/* -----------------------------------------------------------------------------
 * eslint config
 * -------------------------------------------------------------------------- */

module.exports = {
  root: true,
  extends: 'standard',
  rules: {
    'quote-props': ['error', 'consistent-as-needed']
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { jest: true }
    }
  ]
}
