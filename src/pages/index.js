import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import ExcerptNote from '../components/excerptnote'
import Heading from '../components/heading'
import Page from '../components/page'


function Index({location, data}) {
  const set = data.allMarkdownRemark.edges
  const { settings } = data

  return (
    <Page location={location.pathname} title="Home">
      <Heading>Recent</Heading>

      {
        set.map(({node}) => {
          return (
            <ExcerptNote key={node.frontmatter.id}
              title={node.frontmatter.title}
              href={node.fields.slug}
              date={node.frontmatter.date}
              author={settings.author.name}>
              <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
            </ExcerptNote>
          )
        })
      }
    </Page>
  )
}

Index.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Recent {
    settings {
      author { name }
    }
    allMarkdownRemark(
      limit: 1
      filter: { frontmatter: { type: {eq: "note"}}}
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          timeToRead
          excerpt(format: HTML, pruneLength: 500)
          frontmatter {
            id
            title
            type
            tags
            date
          }
        }
      }
    }
  }
`
export default Index
