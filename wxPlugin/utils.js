import prettifyXml from 'prettify-xml'
import babylon from '@babel/parser'
/**
 * node 转换
 * AbC =》 ab-c
 * Image => image
 * @param {*} str
 */
export function transformCase(str) {
  return str
    .replace(str.charAt(0), str.charAt(0).toLowerCase())
    .replace(/[A-Z]/g, ($1) => $1.replace($1, `-${$1.toLowerCase()}`))
}
export function prettifyXml(wxml) {
  return prettifyXml(wxml, { indent: 2 })
}
export function parseCode(code) {
  var options = {
    babelrc: false,
    sourceType: 'module',
    plugins: [
      'jsx',
      'objectRestSpread',
      'classProperties',
      'classPrivateProperties',
      'decorators',
    ],
  }

  return babylon.parse(code, options)
}
