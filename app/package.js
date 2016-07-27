const clone = require('git-clone')
const path = require('path')
const jetpack = require('fs-jetpack')
const npmInstall = require('./lib/npmInstall')

const configuration = require('./configuration')

class Package {
  constructor (url) {
    this.path = path.join(configuration.pluginDir, url)
    this.url = url
    this.clone = clone
  }

  load () {
    return this.download().then(() => {
      const plugin = require(path.join(this.path, 'zazu.js'))
      plugin.blocks = plugin.blocks || {}
      plugin.blocks.external = plugin.blocks.external || []
      plugin.blocks.input = plugin.blocks.input || []
      plugin.blocks.output = plugin.blocks.output || []
      return plugin
    })
  }

  download () {
    return new Promise((resolve, reject) => {
      if (jetpack.exists(this.path)) {
        return resolve()
      }
      this.clone('https://github.com/' + this.url, this.path, { shallow: true }, (error) => {
        if (error) {
          reject(`Package '${this.url}' failed to load.`)
        } else {
          const promises = []
          if (jetpack.exists(path.join(this.path, 'package.json'))) {
            const promise = npmInstall(this.path)
            promises.push(promise)
          }
          Promise.all(promises).then(resolve)
        }
      })
    })
  }
}

module.exports = Package