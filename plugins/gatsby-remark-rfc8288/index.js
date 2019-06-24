const visit = require('unist-util-visit')

module.exports = ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, 'code', node => {
    if (node.lang === 'rfc8288') {
      node.lang = null
    }
  })

  return markdownAST
}
