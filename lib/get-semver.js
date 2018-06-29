'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const { dirname } = require('path')

// 3rd party
const readPkgUp = require('read-pkg-up')

/* -----------------------------------------------------------------------------
 * getSemver
 * -------------------------------------------------------------------------- */

const semvers = {}

const lookupSemver = (root, name) => {
  const { pkg } = readPkgUp.sync({ cwd: dirname(root) })
  const semver =
    (pkg['dependencies'] && pkg['dependencies'][name]) ||
    (pkg['devDependencies'] && pkg['devDependencies'][name])

  return (semvers[root] = semver)
}

module.exports = (root, name) => {
  // If root path does not include `node_modules` it must have been a symlink
  // converted to a realpath of a module outside of the consuming project
  const isSymlink = !root.includes('node_modules')

  // We can only get the semver of packages that are installed into the
  // node_modules directory where we have access to the parent package.json
  if (!isSymlink) {
    return semvers[root] || lookupSemver(root, name)
  }
}
