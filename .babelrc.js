const removePlugin = require('./lib/remove')
const transformJSXToWXml = require('./lib/index')
const presets = ['@babel/preset-env']
const plugins = [removePlugin, transformJSXToWXml, '@babel/plugin-syntax-jsx']

module.exports = { presets, plugins }
