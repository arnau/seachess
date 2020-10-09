import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import sanitizeHtml from 'sanitize-html'
import GithubSlugger from 'github-slugger'

import Md from'../components/md'
import Layout from '../components/layout'
import Meta from '../components/meta'
import MetaNote from '../components/metanote'
import Licence from '../components/licence'
import Subscription from '../components/subscription'

const slug = GithubSlugger.slug

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  excerpt: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(4),
  },
  doctype: {
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    verticalAlign: 'super',
    padding: '0 4px',
    marginLeft: theme.spacing(1),
    backgroundColor: '#fca'
  },
  metanote: {
    fontSize: 14,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  },
  anchor: {
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    verticalAlign: 'super',
  }
}))


function Bulletin({location, data}) {
  const classes = useStyles()
  const { id, description, publication_date } = data.issue
  const title = `Issue ${id}`
  const { author } = data
  const links = data.links.edges

  return (
    <Layout location="/bulletins/">
      <article className={classes.root} resource={location.pathname} typeof="BlogPosting">
        <Meta title={sanitizeHtml(title, {allowedTags: [], allowedAttributes: {}})} />
        <div>
          <MetaNote date={publication_date} author={author.name} className={classes.metanote} />

          <Typography
            className={classes.header}
            property="name" component="h1" variant="h3">
            {title}
          </Typography>

          <Subscription />

          <Typography component="p" className={classes.excerpt}>
            <Md raw={description} />
          </Typography>
          <hr />

          <div property="articleBody">
            {
              links.map(({ node }) => {
                const doctype = node.content_type == 'text'
                  ? ''
                  : <span className={classes.doctype}>{node.content_type}</span>
                const anchor = slug(node.title)
                return (
                  <div key={node.url}>
                    <Typography id={anchor} component="h2" variant="h6">
                      <a href={node.url}>{node.title}</a>
                      {doctype}
                    </Typography>
                    <Typography component="div">
                      <Md raw={node.comment} />
                    </Typography>
                    <hr />
                  </div>
                )
              })
            }
          </div>
        </div>

        <Licence />
      </article>
    </Layout>

  )
}

Bulletin.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}

/* eslint no-undef: "off" */
export const query = graphql`
  query BulletinById($id: String!) {
    author(id: { eq: "arnau"}) {
      name
    }

    issue(id: { eq: $id }) {
      id
      slug
      description
      publication_date
    }

    links: allIssueEntry(filter: { issue_id: { eq: $id } }) {
      edges {
        node {
          url
          title
          comment
          content_type
          issue_id
        }
      }
    }
  }
`

export default Bulletin
