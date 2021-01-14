'use strict';

var helperPluginUtils = require('@babel/helper-plugin-utils');
var syntaxClassProperties = require('@babel/plugin-syntax-class-properties');
var generate = require('@babel/generator');
var t = require('@babel/types');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var syntaxClassProperties__default = /*#__PURE__*/_interopDefaultLegacy(syntaxClassProperties);
var generate__default = /*#__PURE__*/_interopDefaultLegacy(generate);

const wxAdapter = {
  if: 'wx:if',
  else: 'wx:else',
  elseif: 'wx:elif',
  for: 'wx:for',
  forItem: 'wx:for-item',
  forIndex: 'wx:for-index',
  key: 'wx:key',
  types: ['App', 'Page', 'Component'],
};

class WXTreeState {
  name = '' // 组件名
  type = '' // 组件类型
  methods = [] //组件的类方法
  data = {} // 小程序Page或者Component的data

  isTemplate = false
  importComponent = {} //导入的组件
  sourcePath = '' //当前文件路径, 用于css抽取
}

var wxTreeState = new WXTreeState();

const IVisitor = {
  // 抽取父类的名字与转换构造器
  ClassDeclaration: {
    enter(path, state) {
      const { adapter } = state.opts;
      const wxType = path.node.superClass ? path.node.superClass.name : '';
      if (wxType && adapter.types.includes(wxType)) {
        // 获取组件类型与名字
        wxTreeState.type = wxType;
        if (wxType === 'Component') {
          wxTreeState.name = path.node.id.name;
        }
      }
    },
    exit(path) {
      // 把该节点从path中移除
      const call = t.expressionStatement(
        t.callExpression(t.identifier(wxTreeState.type), [
          t.objectExpression(wxTreeState.methods),
        ])
      );
      path.replaceWith(call);
    },
  },
  // 类方法
  ClassMethod: {
    enter(path) {
      const methodName = path.node.key.name;
      console.log(2222, methodName);
      wxTreeState.walkingMethod = methodName;

      if (['render', 'constructor'].includes(methodName)) return
      const method = t.ObjectProperty(
        t.identifier(methodName),
        t.functionExpression(
          null,
          path.node.params,
          path.node.body,
          path.node.generator,
          path.node.async
        )
      );
      wxTreeState.methods.push(method);
    },
    exit(path) {
      const methodName = path.node.key.name;
      if (methodName === 'render') {
        //当render域里有赋值时, BlockStatement下面有的不是returnStatement,而是VariableDeclaration
        const wxmlAST = path.node.body.body.find(
          (i) => i.type === 'ReturnStatement'
        );
        // TODO 使用Dom el转换,而不是直接用小程序el转换
        const wxml = generate__default['default'](wxmlAST.argument).code;
        wxTreeState.wxml = wxmlAST;
        path.remove();
      }
      if (methodName === 'constructor') {
        for (const body of path.node.body.body) {
          if (t.isExpressionStatement(body)) {
            converters.dataProps.dataHandler(body);
          }
        }
      }
    },
  },
  // 移除import，小程序会转换成 AMD 模块
  ImportDeclaration(path, state) {
    const source = path.node.source.value;
    path.remove();
  },
  //AMD不认识export语句，要删掉，或转换成module.exports
  ExportDefaultDeclaration(path) {
    path.remove();
  },
  //AMD不认识export语句，要删掉，或转换成module.exports
  ExportNamedDeclaration(path) {
    path.remove();
  },
  ClassProperty: {},
  // 修改 this.setState
  MemberExpression(path) {
    const code = generate__default['default'](path.node).code;
    if (code === 'this.state' && wxTreeState.walkingMethod !== 'constructor') {
      path.node.property.name = 'data';
    }
  },
  CallExpression(path) {
    const callee = path.node.callee || Object;
    const property = callee.property;
    if (
      wxTreeState.type === 'Component' &&
      property &&
      property.name === 'setState'
    ) {
      property.name = 'setData';
    }
  },
};

/**
 * node 转换
 * AbC =》 ab-c
 * Image => image
 * @param {*} str
 */
function transformCase(str) {
  return str
    .replace(str.charAt(0), str.charAt(0).toLowerCase())
    .replace(/[A-Z]/g, ($1) => $1.replace($1, `-${$1.toLowerCase()}`))
}

const IVisitorJSX = {
  JSXIdentifier(path) {
    path.node.name = transformCase(path.node.name);
  },
  JSXAttribute(path, state) {
    const { node } = path;
    const attrName = node.name.name;
    const { adapter } = state.opts;
    switch (attrName) {
      case 'key':
        node.name.name = adapter.key;
        break
      case 'className':
        if (!adapter.styleKeyword) {
          node.name.name = 'class';
        } else {
          path.parentPath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier('class'), node.value)
          );
        }
        break
      case 'style':
        if (adapter.styleKeyword && !isNativeComponent(path)) {
          node.name.name = 'styleSheet';
          path.parentPath.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier('style'), node.value)
          );
        }
        break
      case 'ref':
        if (t.isJSXExpressionContainer(node.value)) {
          node.value = t.stringLiteral(genExpression(node.value.expression));
        }
        if (t.isStringLiteral(node.value)) {
          refs.push(node.value);
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
        path.skip();
    }
  },
  JSXExpressionContainer(path) {
    console.log(99999, path.node);
    path.node.name = t.identifier(wxTags[path.node.name.name]);
    path.node.attributes.forEach((attr, index) => {
      const attrName = attr.name.name.toLowerCase();
      console.log(8888, attrName);
      if (attrName === 'classname') {
        // 转换className到class
        path.node.attributes[index] = t.jsxAttribute(
          t.jsxIdentifier('class'),
          t.stringLiteral('app')
        );
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
        let tempAttrs = '';
        attr.value.expression.properties.forEach((style) => {
          const key = generate__default['default'](style.key).code
          ;          // TODO 未支持变量转换 'position:{{p}}'
          const value = style.value.value;
          tempAttrs += `${key}:${value}`;
        });
        attr.value = t.stringLiteral(`${tempAttrs}`);
      }
    });
  },

  JSXOpeningElement: {
    enter(path) {},
    exit(path) {
      const tag = path.node.name.name;
    },
  },
  JSXClosingElement: function (path) {
    if (!path.node.selfClosing) {
      const tag = path.node.name.name;
      path.node.name = t.identifier(wxTags[tag]);
    }
  },
};

const transformJSXToWXml = (api, options) => {
  api.assertVersion(7);
  if (!options.adapter) {
    options.adapter = wxAdapter;
  }
  return {
    inherits: syntaxClassProperties__default['default'], // 解析es6 class 属性
    visitor: { ...IVisitor, ...IVisitorJSX },
  }
};

var index = helperPluginUtils.declare(transformJSXToWXml);

module.exports = index;
