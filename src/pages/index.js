import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import CardContent from '@material-ui/core/CardContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import ExcerptNote from '../components/excerptnote'
import Heading from '../components/heading'
import Page from '../components/page'
import Link from '../components/link'


function Index({location, data}) {
  const set = data.allMarkdownRemark.edges
  const { settings } = data

  return (
    <Page location={location.pathname} title="Home">
      <Paper variant="outlined">
        <CardContent>
          <Typography>
            <strong>Seachess</strong> is where I, Arnau Siches, publish my <Link
              to="/notes/">notes</Link> and <Link to="/sketches/">sketches</Link>.
            Check out the <Link to="/about/">about</Link> to know more about me.
          </Typography>
        </CardContent>
      </Paper>

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
      limit: 2
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
