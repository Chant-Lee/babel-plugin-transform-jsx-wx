import generate from '@babel/generator'
import * as t from '@babel/types'
import { transformCase } from './utils'

export const IVisitorJSX = {
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
  JSXExpressionContainer(path) {
    console.log(99999, path.node)
    path.node.name = t.identifier(wxTags[path.node.name.name])
    path.node.attributes.forEach((attr, index) => {
      const attrName = attr.name.name.toLowerCase()
      console.log(8888, attrName)
      if (attrName === 'classname') {
        // 转换className到class
        path.node.attributes[index] = t.jsxAttribute(
          t.jsxIdentifier('class'),
          t.stringLiteral('app')
        )
        return
      }
      // if (WXML_EVENTS[attrName]) { // 事件转换
      //   //映射事件
      //   attr.name = t.identifier(WXML_EVENTS[attrName]);
      //   const funName = generate(attr.value.expression.property).code;
      //   if (t.isCallExpression(attr.value.expression) || t.isArrowFunctionExpression(attr.value.expression)) {
      //       const warningCode = generate(attr.value.expression).code;
      //       console.log(
      //         `小程序不支持在模板中使用function/arrow function，因此 '${warningCode}' 不会被编译`
      //       );
      //   }
      //   attr.value = t.stringLiteral(funName);
      //   return;
      // }
      if (attrName === 'style') {
        // 样式转换
        let tempAttrs = ''
        attr.value.expression.properties.forEach((style) => {
          const key = generate(style.key).code
          ;``
          // TODO 未支持变量转换 'position:{{p}}'
          const value = style.value.value
          tempAttrs += `${key}:${value}`
        })
        attr.value = t.stringLiteral(`${tempAttrs}`)
      }
    })
  },

  JSXOpeningElement: {
    enter(path) {},
    exit(path) {
      const tag = path.node.name.name
    },
  },
  JSXClosingElement: function (path) {
    if (!path.node.selfClosing) {
      const tag = path.node.name.name
      path.node.name = t.identifier(wxTags[tag])
    }
  },
}
