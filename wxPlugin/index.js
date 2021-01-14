import { declare } from '@babel/helper-plugin-utils'
import syntaxClassProperties from '@babel/plugin-syntax-class-properties'
import { wxAdapter } from './constants'
import { IVisitor } from './visitor'
import { IVisitorJSX } from './visitorjsx'
import wxTreeState from './WXTreeState'
import { parseCode } from './utils'

const transformJSXToWXml = (api, options) => {
  api.assertVersion(7)
  if (!options.adapter) {
    options.adapter = wxAdapter
  }
  return {
    inherits: syntaxClassProperties, // 解析es6 class 属性
    visitor: { ...IVisitor, ...IVisitorJSX },
  }
}
export { wxTreeState, parseCode }
export default declare(transformJSXToWXml)
