'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

const { pkgB, dep1, dep2 } = require('./fixtures/pkg-a')

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

test('Should resolve to the same module if semver intersects', () => {
  expect(pkgB.dep1).toBe(dep1)
})

test('Should resolve to different modules if semver does not intersect', () => {
  expect(pkgB.dep2).not.toBe(dep2)
})
