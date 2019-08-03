import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import ExcerptNote from '../components/excerptnote'
import Heading from '../components/heading'
import Page from '../components/page'


function Notes({location, data}) {
  const set = data.allMarkdownRemark.edges
  const { settings } = data

  return (
    <Page location={location.pathname} title="Notes">
      <Heading>Notes</Heading>
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

Notes.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Notes {
    settings {
      author { name }
    }
    allMarkdownRemark(
      filter: { frontmatter: { type: {eq: "note"}}}
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            id
            title
            type
            date
          }
          excerpt(format: HTML, pruneLength: 100)
        }
      }
    }
  }
`
export default Notes
