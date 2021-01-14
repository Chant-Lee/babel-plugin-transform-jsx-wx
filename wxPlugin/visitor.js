import generate from '@babel/generator'
import * as t from '@babel/types'

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
  // 类方法
  ClassMethod: {
    enter(path) {
      const methodName = path.node.key.name
      console.log(2222, methodName)
      wxTreeState.walkingMethod = methodName

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
      )
      wxTreeState.methods.push(method)
    },
    exit(path) {
      const methodName = path.node.key.name
      if (methodName === 'render') {
        //当render域里有赋值时, BlockStatement下面有的不是returnStatement,而是VariableDeclaration
        const wxmlAST = path.node.body.body.find(
          (i) => i.type === 'ReturnStatement'
        )
        // TODO 使用Dom el转换,而不是直接用小程序el转换
        const wxml = generate(wxmlAST.argument).code
        wxTreeState.wxml = wxmlAST
        path.remove()
      }
      if (methodName === 'constructor') {
        for (const body of path.node.body.body) {
          if (t.isExpressionStatement(body)) {
            converters.dataProps.dataHandler(body)
          }
        }
      }
    },
  },
  // 移除import，小程序会转换成 AMD 模块
  ImportDeclaration(path, state) {
    const source = path.node.source.value
    path.remove()
  },
  //AMD不认识export语句，要删掉，或转换成module.exports
  ExportDefaultDeclaration(path) {
    path.remove()
  },
  //AMD不认识export语句，要删掉，或转换成module.exports
  ExportNamedDeclaration(path) {
    path.remove()
  },
  ClassProperty: {},
  // 修改 this.setState
  MemberExpression(path) {
    const code = generate(path.node).code
    if (code === 'this.state' && wxTreeState.walkingMethod !== 'constructor') {
      path.node.property.name = 'data'
    }
  },
  CallExpression(path) {
    const callee = path.node.callee || Object
    const property = callee.property
    if (
      wxTreeState.type === 'Component' &&
      property &&
      property.name === 'setState'
    ) {
      property.name = 'setData'
    }
  },
}
