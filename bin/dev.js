const chalk = require('chalk').default
const Parse = require('./Parse')
// 开始创建
async function build() {
  try {
    const parser = new Parse('./wxapp/app.js')
    await parser.parse()
    // 暂时关闭watch方便开发
    // parser.watch('./src')
  } catch (e) {
    console.log(chalk.redBright(e))
    console.log(e)
  }
}

build()
