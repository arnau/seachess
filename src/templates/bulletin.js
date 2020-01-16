import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import rehypeReact from 'rehype-react'
import sanitizeHtml from 'sanitize-html'

import Layout from '../components/layout'
import Meta from '../components/meta'
import MetaNote from '../components/metanote'
import Licence from '../components/licence'
import Subscription from '../components/subscription'


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  metanote: {
    fontSize: 14,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  }
}))

const renderAst = new rehypeReact({
  createElement: React.createElement,
  // components: { "interactive-counter": Counter },
  components: {},
}).Compiler

function Bulletin({location, data}) {
  const classes = useStyles()
  const note = data.markdownRemark
  const meta = note.frontmatter
  const title = meta.title
  const body = renderAst(note.htmlAst)

  return (
    <Layout location="/bulletins/">
      <article className={classes.root} resource={location.pathname} typeof="BlogPosting">
        <Meta title={sanitizeHtml(title, {allowedTags: [], allowedAttributes: {}})} />
        <div>
          <MetaNote date={meta.date} author={meta.author.name} className={classes.metanote} />

          <Typography
            className={classes.header}
            property="name" component="h1" variant="h3" dangerouslySetInnerHTML={{ __html: title }}/>

          <Subscription />
          <div property="articleBody">{body}</div>
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
  query BulletinBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      excerpt
      frontmatter {
        title
        date
        tags
        author {
          name
        }
      }
      fields {
        slug
      }
    }
  }
`

export default Bulletin
