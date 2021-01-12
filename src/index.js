// import IVisitor from './visitor'
import { transformCase } from './utils'
const namespace = 'wx'
const tagNameLetterCase = 'kebab'
const attrNameLetterCase = 'kebab'
const delimiterStart = '{{'
const delimiterEnd = '}}'
const directiveIf = `${namespace}:if`
const directiveElseIf = `${namespace}:elif`
const directiveElse = `${namespace}:else`
const directiveFor = `${namespace}:for`
const directiveForIndex = `${namespace}:for-index`
const directiveForItem = `${namespace}:for-item`

const transformJSXToWXml = function ({ types: t }) {
  return {
    visitor: {
      JSXIdentifier(path) {
        path.node.name = transformCase(path.node.name)
      },
      JSXExpressionContainer(path) {
        const expression = path.get('expression')
        if (
          expression.isLogicalExpression() &&
          expression.node.operator === '&&'
        ) {
          /**
           * {flag && <view></view>}
           * to
           * <view wx:if={flag}></view>
           */
          const jsx = expression.get('right')
          const opening = jsx.get('openingElement')
          const condition = expression.get('left')
          let value
          if (condition.isIdentifier()) {
            value = condition.node.name
          } else if (condition.isMemberExpression()) {
            const object = condition.get('object')
            const property = condition.get('property')
            if (object.isIdentifier() && property.isIdentifier()) {
              value = `${object.node.name}.${property.node.name}`
            }
          }
          if (value) {
            opening.node.attributes = [
              ...opening.node.attributes,
              t.jSXAttribute(
                t.jSXIdentifier(directiveIf),
                t.stringLiteral(`${delimiterStart}${value}${delimiterEnd}`)
              ),
            ]
          }
          path.replaceWith(jsx)
        } else if (expression.isCallExpression()) {
          /**
           * {['a', 'b', 1, 2].map((it, idx) => <view>{idx}.{it}</view>)}
           * to
           * <view wx:for="{{['a', 'b', 1, 2]}}" wx:for-index="idx" wx:for-item="it">
           *   {idx}.{it}
           * </view>
           *
           * {array.map((it, idx) => <view>{idx}.{it}</view>)}
           * to
           * <view wx:for="{{array}}" wx:for-index="idx" wx:for-item="it">
           *   {idx}.{it}
           * </view>
           */
          const callee = expression.get('callee')
          if (callee.isMemberExpression()) {
            const property = callee.get('property')
            if (property.isIdentifier() && property.node.name === 'map') {
              const arg = expression.get('arguments.0')
              if (arg && arg.isArrowFunctionExpression()) {
                const body = arg.get('body')
                if (body.isJSXElement()) {
                  const opening = body.get('openingElement')
                  const item = arg.get('params.0')
                  const index = arg.get('params.1')
                  const object = callee.get('object')
                  let array
                  if (object.isIdentifier()) {
                    array = object.node.name
                  } else if (object.isArrayExpression()) {
                    array = `[${object.node.elements
                      .map((it) => {
                        switch (it.type) {
                          case 'StringLiteral':
                            return `'${it.value}'`
                          case 'NumericLiteral':
                            return `${it.value}`
                          default:
                            throw object.buildCodeFrameError(
                              `Array's elements in View Expression should be one of these primitive types: String, Number, Boolean`
                            )
                        }
                      })
                      .filter((it) => it !== '')}]`
                  } else {
                    throw object.buildCodeFrameError(
                      'Untreatable expression: syntax not allowed here'
                    )
                  }
                  if (array) {
                    opening.node.attributes = [
                      ...opening.node.attributes,
                      t.jSXAttribute(
                        t.jSXIdentifier(directiveFor),
                        t.stringLiteral(
                          `${delimiterStart}${array}${delimiterEnd}`
                        )
                      ),
                    ]

                    if (item.isIdentifier()) {
                      opening.node.attributes.push(
                        t.jSXAttribute(
                          t.jSXIdentifier(directiveForItem),
                          t.stringLiteral(
                            `${delimiterStart}${item.node.name}${delimiterEnd}`
                          )
                        )
                      )
                    }

                    if (index && index.isIdentifier()) {
                      opening.node.attributes.push(
                        t.jSXAttribute(
                          t.jSXIdentifier(directiveForIndex),
                          t.stringLiteral(
                            `${delimiterStart}${index.node.name}${delimiterEnd}`
                          )
                        )
                      )
                    }
                  }
                  path.replaceWith(body)
                }
              }
            }
          }
        } else if (expression.isIdentifier()) {
          console.log(8888, path)
          path.replaceWith(
            t.jSXText(`${delimiterStart}${expression.node.name}${delimiterEnd}`)
          )
        } else if (
          expression.isStringLiteral() ||
          expression.isBooleanLiteral() ||
          expression.isNumericLiteral()
        ) {
          path.replaceWith(t.jSXText(expression.node.value.toString()))
        } else {
        }
      },
    },
  }
}

export default transformJSXToWXml
