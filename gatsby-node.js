const path = require('path')

exports.createSchemaCustomization = ({ actions }) => {
  const { createFieldExtension, createTypes } = actions

  createFieldExtension({
    name: 'slug',
    args: {
      base: 'String'
    },
    extend({ base }) {
      return {
        resolve(source) {
          return `${base}/${source.id}`
        },
      }
    },
  })

  const typeDefs = `
    type Issue implements Node @dontInfer {
      id: ID!
      publication_date : Date @dateformat
      summary: String!
      slug : String! @slug(base: "/bulletins")
    }

    type IssueEntry implements Node @dontInfer {
      url : ID!
      title : String!
      summary: String!
      content_type : String!
      issue_id : String!
    }

    type Sketch implements Node @dontInfer {
      caption: String!
      id: ID!
      image: File! @fileByRelativePath
      date: Date @dateformat
      author: Author! @link
      tools: [Tool]
      slug : String! @slug(base: "/sketches")
    }

    type Tool {
      id: ID!
      name: String!
      url: String
    }

    type Settings implements Node @dontInfer {
      title: String!
      description: String
      url: String
      author: Author
      copyright: String
      tools: [Tool]
    }

    type Author implements Node @childOf(types: ["Settings", "Sketch"]) {
      id: ID!
      name: String!
      github: Tool
      twitter: Tool
      keybase: Tool
    }
  `

  createTypes(typeDefs)
}

async function createAuthorNodeFromSettings({
  node,
  actions,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions
  const authorNode = {
    ...node.author,
    children: [],
    parent: node.id,
    internal: {
      type: 'Author',
      contentDigest: createContentDigest(node.author),
    }
  }

  createNode(authorNode)
  createParentChildLink({parent: node, child: authorNode})
}


exports.onCreateNode = (args) => {
  const { node, actions } = args
  const { createNodeField } = actions

  if (node.internal.type === 'Settings') {
    createAuthorNodeFromSettings(args)
  }

  if (node.internal.type === 'MarkdownRemark') {
    const meta = node.frontmatter

    if (typeof meta === 'undefined') {
      throw new Error(`${node.id} has no meta`)
    }

    if (meta.type === 'note') {
      if (typeof meta.id === 'undefined') {
        throw new Error(`${node.id} has no id`)
      }

      createNodeField({node, name: 'slug', value: `/notes/${meta.id}`})
    }

  }
}

async function createSketchPages({ graphql, actions }) {
  const { createPage } = actions
  const component = path.resolve('src/templates/sketch.js')
  const result = await graphql(`
      {
        allSketch(sort: {fields: date, order: ASC}) {
          edges { node { id } }
        }
      }
    `)

  if (result.errors) {
    console.error(result.errors)
    throw result.errors
  }

  result.data.allSketch.edges.forEach(({ node }) => {
    const path = `/sketches/${node.id}`
    createPage({
      path,
      component,
      context: {
        id: node.id,
        slug: path,
      }
    })
  })
}

async function createNotePages({ graphql, actions }) {
  const { createPage } = actions
  const component = path.resolve('src/templates/note.js')
  const result = await graphql(`
      {
        allMarkdownRemark(filter: {frontmatter: {type: {eq: "note"}}}) {
          edges { node { fields { slug } frontmatter { type } } }
        }
      }
    `)

  if (result.errors) {
    console.error(result.errors)
    throw result.errors
  }

  result.data.allMarkdownRemark.edges.forEach(({node}) => {
    createPage({
      path: node.fields.slug,
      component,
      context: {
        slug: node.fields.slug,
      }
    })
  })
}

async function createBulletinPages({ graphql, actions }) {
  const { createPage } = actions
  const component = path.resolve('src/templates/bulletin.js')
  const result = await graphql(`
      {
        allIssue {
          edges { node { id slug } }
        }
      }
    `)

  if (result.errors) {
    console.error(result.errors)
    throw result.errors
  }

  result.data.allIssue.edges.forEach(({ node }) => {
    createPage({
      path: node.slug,
      component,
      context: {
        id: node.id,
        slug: node.slug,
      }
    })
  })
}

exports.createPages = async (args) => {
  await createSketchPages(args)
  await createNotePages(args)
  await createBulletinPages(args)
}
