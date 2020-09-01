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


function Group({ data, settings }) {
  const { author } = settings

  return (
    data.map(({node}) => {
      const { id, title, date } = node.frontmatter
      const { slug } = node.fields

      return (
        <ExcerptNote key={id}
          title={title}
          href={slug}
          date={date}
          author={author.name}>
          <div dangerouslySetInnerHTML={{ __html: node.excerpt }} />
        </ExcerptNote>
      )
    })
  )
}

Group.propTypes = {
  data: PropTypes.array,
  settings: PropTypes.object,
}

function Index({location, data}) {
  const { settings } = data

  return (
    <Page location={location.pathname} title="Home">
      <Paper variant="outlined">
        <CardContent>
          <Typography>
            <strong>Seachess</strong> is where I publish my <Link
              to="/notes/">notes</Link> and <Link to="/sketches/">sketches</Link>.
            Check out the <Link to="/about/">about</Link> to know more about me.
          </Typography>
        </CardContent>
      </Paper>

      <Heading>Recent</Heading>

      {
        data.bulletin.edges.map(({ node }) =>
          <ExcerptNote key={node.id}
            title={`Issue ${node.id}`}
            href={node.slug}
            date={node.publication_date}
            author={settings.author.name}/>
        )
      }
      <Group data={data.notes.edges} settings={settings} />

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
    bulletin: allIssue(
      limit: 1
      sort: { fields: publication_date, order: DESC }
    ) {
      edges {
        node {
          id
          slug
          publication_date
        }
      }
    }
    notes: allMarkdownRemark(
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
