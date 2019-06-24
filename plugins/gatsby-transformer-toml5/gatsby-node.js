const toml = require('ion-parser')

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}, options = {}) {
  const { createNode, createParentChildLink } = actions
  const defaultType = options.defaultType || 'TOML'

  if (node.extension !== 'toml') {
    return
  }

  const content = await loadNodeContent(node)
  const parsedContent = toml.parse(content)

  const contentDigest = createContentDigest(parsedContent)
  const type = ('type' in parsedContent) ? parsedContent.type : defaultType

  delete parsedContent.type

  const newNode = {
    ...parsedContent,
    id: parsedContent.id || createNodeId(`${node.id} >>> ${type}`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest,
      content,
      type,
      mediaType: 'application/toml',
      description: `A Toml based node of type ${type}`
    },
  }

  createNode(newNode)
  createParentChildLink({ parent: node, child: newNode })
  return
}

exports.onCreateNode = onCreateNode
