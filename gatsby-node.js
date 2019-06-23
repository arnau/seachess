const path = require('path')

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'MarkdownRemark') {
    const meta = node.frontmatter

    if (typeof meta === 'undefined') {
      throw new Error(`${node.id} has no meta`)
    }

    if (meta.type === 'note') {
      if (typeof meta.date === 'undefined') {
        throw new Error(`${node.id} has no date`)
      }

      const group = meta.date.slice(0, 7)

      createNodeField({node, name: 'group', value: group})
      createNodeField({node, name: 'slug', value: `/${group}/${meta.id}`})
    }
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const notePage = path.resolve('src/templates/note.js')
  const groupPage = path.resolve('src/templates/group.js')
  // const tagPage = path.resolve('src/templates/tag.jsx')

  const markdownQueryResult = await graphql(
    `
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
                group
              }
              frontmatter {
                title
                tags
                date
              }
            }
          }
        }
      }
    `
  )

  if (markdownQueryResult.errors) {
    console.error(markdownQueryResult.errors)
    throw markdownQueryResult.errors
  }

  const tagSet = new Set()
  const groupSet = new Set()
  const postsEdges = markdownQueryResult.data.allMarkdownRemark.edges

  postsEdges.sort((a, b) => {
    if (a.frontmatter.date < b.frontmatter.date) return 1
    if (b.frontmatter.date > a.frontmatter.date) return -1

    return 0
  })

  postsEdges.forEach((edge, index) => {
    if (edge.node.frontmatter.tags) {
      edge.node.frontmatter.tags.forEach(tag => {
        tagSet.add(tag)
      })

      groupSet.add(edge.node.fields.group)
    }


    const nextID = index + 1 < postsEdges.length ? index + 1 : 0
    const prevID = index - 1 >= 0 ? index - 1 : postsEdges.length - 1
    const nextEdge = postsEdges[nextID]
    const prevEdge = postsEdges[prevID]

    createPage({
      path: edge.node.fields.slug,
      component: notePage,
      context: {
        slug: edge.node.fields.slug,
        nexttitle: nextEdge.node.frontmatter.title,
        nextslug: nextEdge.node.fields.slug,
        prevtitle: prevEdge.node.frontmatter.title,
        prevslug: prevEdge.node.fields.slug
      }
    })
  })

  groupSet.forEach(group => {
    createPage({
      path: `/${group}/`,
      component: groupPage,
      context: {group}
    })
  })

  // tagSet.forEach(tag => {
  //   createPage({
  //     path: `/tags/${_.kebabCase(tag)}/`,
  //     component: tagPage,
  //     context: {
  //       tag
  //     }
  //   })
  // })
}
