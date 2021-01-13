import { declare } from '@babel/helper-plugin-utils'
import { wxAdapter } from './constants'
import { IVisitor } from './visitor'

const transformJSXToWXml = (api, options) => {
  api.assertVersion(7)
  if (!options.adapter) {
    options.adapter = wxAdapter
  }
  return {
    visitor: IVisitor,
  }
}

export default declare(transformJSXToWXml)
