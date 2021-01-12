const removePlugin = require('./lib/remove')

const presets = ['@babel/preset-env']
const plugins = [removePlugin]

module.exports = { presets, plugins }
