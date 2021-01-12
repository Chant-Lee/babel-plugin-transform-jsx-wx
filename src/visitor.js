import { transformCase } from './utils'

const IVisitor = {
  JSXIdentifier(path) {
    path.node.name = transformCase(path.node.name)
  },
  JSXExpressionContainer(path) {
    const expression = path.get('expression')
    /**
     * boolean && <tag>
     */
    if (expression.isLogicalExpression() && expression.node.operator === '&&') {
      const rightElement = expression.get('right')
      const openingElement = expression.get('JSXOpeningElement')
      const leftBoolean = expression.get('left')
      let value = null
      // 是否是标识符
      if (leftBoolean.isIdentifier()) {
        value = leftBoolean.node.name
      } else if (leftBoolean.isMemberExpression()) {
        const object = leftBoolean.get('object')
        const property = leftBoolean.get('property')
        if (object.isIdentifier() && property.isIdentifier()) {
          value = `${object.node.name}.${property.node.name}`
        }
      }
      // 如果value 存在
      if (value) {
        console.log(7777, openingElement.node.attributes)
        openingElement.node.attributes = [...openingElement.node.attributes]
      }
    }
  },
}

export default IVisitor
