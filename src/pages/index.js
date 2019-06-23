import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'

import Layout from '../components/layout'
import Meta from '../components/meta'

function Index({data}) {
  const set = data.allMarkdownRemark.edges

  return (
    <Layout>
      <Meta title="Home" />
      <h1>Recent</h1>
      {
        set.map(({node}) => {
          return (
            <div key={node.frontmatter.id}>
              <h2><Link
                to={node.fields.slug}>{node.headings[0].value}</Link></h2>
              <span> ({node.frontmatter.date.slice(0, 10)})</span>
              <div dangerouslySetInnerHTML={{ __html:
                node.excerpt.replace(/^[^\n]+\n/, '') }} />
            </div>
          )
        })
      }
    </Layout>
  )
}

Index.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Recent {
    allMarkdownRemark(
      limit: 10
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
            group
          }
          timeToRead
          excerpt(format: HTML)
          frontmatter {
            id
            type
            tags
            date
          }
          headings(depth: h1) {
            value
          }
        }
      }
    }
  }
`
export default Index
