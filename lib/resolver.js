'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const { dirname } = require('path')

// 3rd party
const defaultResolver = require('jest-resolve/build/default_resolver').default
const readPkgUp = require('read-pkg-up')
const semver = require('semver')
const debug = require('debug')

// lib
const getSemver = require('./get-semver')

/* -----------------------------------------------------------------------------
 * resolver
 * -------------------------------------------------------------------------- */

const print = debug('jest-dedupe-resolver')

const pkgs = {}
const files = {}

const lookupPkg = file => {
  const { pkg, path } = readPkgUp.sync({ cwd: dirname(file) })
  const { name, version } = pkg
  const root = dirname(path)
  const semver = getSemver(root, name)

  return (files[file] = { name, version, semver, root })
}

const getPkg = file => {
  return files[file] || lookupPkg(file)
}

module.exports = (src, options) => {
  const resolved = defaultResolver(src, options)

  // No need to jump through hoops if we are processing a relative import
  const REGEX_RELATIVE_IMPORT = /^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\/])/
  if (REGEX_RELATIVE_IMPORT.test(src)) {
    return resolved
  }

  // We are inside of a symlink and require a pkg within node_modules. We need to
  // ensure only a single version of the dep is used.
  const pkg = getPkg(resolved)
  const cached = pkgs[pkg.name]

  if (cached) {
    if (
      semver.satisfies(pkg.version, cached.semver) ||
      pkg.version === cached.version
    ) {
      return resolved.replace(pkg.root, cached.root)
    } else if (cached.semver) {
      print(
        `Unable to dedupe "${pkg.name}": ` +
          `${pkg.version} does not satisfy ${cached.semver}`
      )
    }
  } else {
    pkgs[pkg.name] = pkg
  }

  return resolved
}
