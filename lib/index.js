'use strict';

var generate = require('@babel/generator');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

class WXTreeState {
  outputState = {
    wxml: '',
    wxss: '',
    js: '',
    json: '',
    type: '',
  }
  compile = {
    methods: [], //编译文件的类方法
    data: {}, // 小程序Page或者Component的data
  }
  isTemplate = false
  importComponent = {} //导入的组件
  sourcePath = '' //当前文件路径, 用于css抽取
}

var wxTreeState = new WXTreeState();

const IVisitor = {
  ClassDeclaration: {
    enter(path, state) {
      const { adapter } = state.opts;
      const wxType = path.node.superClass && path.node.superClass.name;
      if (wxType && adapter.types.includes(wxType)) {
        wxTreeState.outputState.type = wxType;
      }
    },
    exit(path) {
      // 把该节点从path中移除
      const call = t.expressionStatement(
        t.callExpression(t.identifier(sharedState.output.type), [
          t.objectExpression(sharedState.compiled.methods),
        ])
      );
      path.replaceWith(call);
    },
  },
  MemberExpression(path) {
    const code = generate__default['default'](path.node).code;
    console.log(7777, code);
    if (code === 'this.state' && sharedState.walkingMethod !== 'constructor') {
      path.node.property.name = 'data';
    }
  },
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
};

const { declare } = require('@babel/helper-plugin-utils');

const transformJSXToWXml = (api, options) => {
  api.assertVersion(7);
  if (!options.adapter) {
    options.adapter = wxAdapter;
  }
  return {
    visitor: IVisitor,
  }
};

var index = declare(transformJSXToWXml);

module.exports = index;
