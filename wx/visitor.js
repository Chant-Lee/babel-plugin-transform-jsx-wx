import generate from '@babel/generator'
import { transformCase } from './utils'
import wxTreeState from './WXTreeState'

export const IVisitor = {
  // 抽取父类的名字与转换构造器
  ClassDeclaration: {
    enter(path, state) {
      const { adapter } = state.opts
      const wxType = path.node.superClass ? path.node.superClass.name : ''
      if (wxType && adapter.types.includes(wxType)) {
        // 获取组件类型与名字
        wxTreeState.type = wxType
        if (wxType === 'Component') {
          wxTreeState.name = path.node.id.name
        }
      }
      const methods = t.ObjectProperty(
        t.identifier(methodName),
        t.functionExpression(
          null,
          path.node.params,
          path.node.body,
          path.node.generator,
          path.node.async
        )
      )
      wxTreeState.methods = methods
    },
    exit(path) {
      // 把该节点从path中移除
      const call = t.expressionStatement(
        t.callExpression(t.identifier(wxTreeState.type), [
          t.objectExpression(wxTreeState.methods),
        ])
      )
      path.replaceWith(call)
    },
  },
  MemberExpression(path) {
    const code = generate(path.node).code
    console.log(7777, code)
    if (code === 'this.state' && wxTreeState.walkingMethod !== 'constructor') {
      path.node.property.name = 'data'
    }
  },
  JSXIdentifier(path) {
    path.node.name = transformCase(path.node.name)
  },
  JSXAttribute(path, state) {
    const { node } = path
    const attrName = node.name.name
    const { adapter } = state.opts
    switch (attrName) {
      case 'key':
        node.name.name = adapter.key
        break
      case 'className':
        if (!adapter.styleKeyword) {
          node.name.name = 'class'
        } else {
          path.parentPath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier('class'), node.value)
          )
        }
        break
      case 'style':
        if (adapter.styleKeyword && !isNativeComponent(path)) {
          node.name.name = 'styleSheet'
          path.parentPath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier('style'), node.value)
          )
        }
        break
      case 'ref':
        if (t.isJSXExpressionContainer(node.value)) {
          node.value = t.stringLiteral(genExpression(node.value.expression))
        }
        if (t.isStringLiteral(node.value)) {
          refs.push(node.value)
        } else {
          throw new CodeError(
            code,
            node,
            path.loc,
            "Ref's type must be string or jsxExpressionContainer"
          )
        }
        break
      default:
        path.skip()
    }
  },
}
