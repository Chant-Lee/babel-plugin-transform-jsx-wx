const t = require('@babel/types')
const { default: traverse } = require('@babel/traverse')

export function transformAttribute(ast, code, adapter) {
  const refs = []
  traverse(ast, {
    JSXAttribute(path) {
      const { node } = path
      const attrName = node.name.name
      switch (attrName) {
        case 'key':
          node.name.name = adapter.key
          break
        case 'className':
          if (!adapter.styleKeyword || isNativeComponent(path)) {
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
  })
  return refs
}
