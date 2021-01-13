export class WXTreeState {
  name = '' // 组件名
  type = '' // 组件类型
  methods = [] //组件的类方法
  data = {} // 小程序Page或者Component的data

  isTemplate = false
  importComponent = {} //导入的组件
  sourcePath = '' //当前文件路径, 用于css抽取
}

export default new WXTreeState()
