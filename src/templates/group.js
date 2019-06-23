import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Meta from '../components/meta'

function Group({data, pageContext}) {
  const { group } = pageContext
  const set = data.allMarkdownRemark.edges

  return (
    <Layout>
      <div>
        {/* <SEO title={post.title} postPath={slug} postNode={postNode} postSEO /> */}
        <Meta title={group} />
        <div>
          <h1>{group}</h1>
          <ul>
            {
              set.map(({node}) => {
                return (
                  <li key={node.frontmatter.id}>
                    <Link to={node.fields.slug}>{node.headings[0].value}</Link>
                    <span> ({node.frontmatter.date.slice(0, 10)})</span>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    </Layout>

  )
}

Group.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object,
}

/* eslint no-undef: "off" */
export const query = graphql`
  query Group($group: Date) {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { group: { eq: $group } } }
    ) {
      edges {
        node {
          fields {
            slug
            group
          }
          timeToRead
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

export default Group
