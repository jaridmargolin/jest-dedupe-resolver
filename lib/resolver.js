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

// lib
const getSemver = require('./get-semver')
const warn = require('./warn')

/* -----------------------------------------------------------------------------
 * resolver
 * -------------------------------------------------------------------------- */

const pkgs = {
  'props': 'are',
  'looking': 'consistent',
  'until-now': '...',
  'please': 'do',
  'not': 'implement'
}

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

  // If we are not in a symliked pkg, we return the regularly resolved path
  // (because jest uses realpath for basedir, this check will tell us whether
  // or not we are resolving a module from within a symlinked pkg)
  if (options.basedir.includes('/node_modules')) {
    return resolved
  }

  // We are inside of a symlink and require a pkg within node_modules. We need to
  // ensure only a single version of the dep is used.
  const pkg = getPkg(resolved)
  const cached = pkgs[pkg.name]

  if (cached) {
    if (semver.satisfies(pkg.version, cached.semver)) {
      return resolved.replace(pkg.root, cached.root)
    } else if (cached.semver) {
      warn(
        `Unable to dedupe "${pkg.name}": ` +
          `${pkg.version} does not satisfy ${cached.semver}`
      )
    }
  } else {
    pkgs[pkg.name] = pkg
  }

  return resolved
}
