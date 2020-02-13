import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import markdown from 'remark-parse'
import rehype2react from 'rehype-react'
import remark2rehype from 'remark-rehype'
import sanitizeHtml from 'sanitize-html'
import unified from 'unified'

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
  }
}))

const processor = unified()
  .use(markdown)
  .use(remark2rehype)
  .use(rehype2react, { createElement: React.createElement })

function Bulletin({location, data}) {
  const classes = useStyles()
  const { title, introduction, date, links, author } = data.bulletin

  return (
    <Layout location="/bulletins/">
      <article className={classes.root} resource={location.pathname} typeof="BlogPosting">
        <Meta title={sanitizeHtml(title, {allowedTags: [], allowedAttributes: {}})} />
        <div>
          <MetaNote date={date} author={author.name} className={classes.metanote} />

          <Typography
            className={classes.header}
            property="name" component="h1" variant="h3">
            {title}
          </Typography>

          <Subscription />

          <Typography component="p">
            {introduction}
          </Typography>
          <hr />

          <div property="articleBody">
            {
              links.map(link => {
                const doctype = link.type
                  ? <span className={classes.doctype}>{link.type}</span>
                  : ''
                return (
                  <div key={link.url}>
                    <Typography component="h2" variant="h6">
                      <a href={link.url}>{link.title}</a>
                      {doctype}
                    </Typography>
                    <Typography component="div">
                      {processor.processSync(link.comment).contents}
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
  query BulletinBySlug($slug: String!) {
    bulletin(slug: { eq: $slug }) {
      id
      slug
      author { name }
      title
      introduction
      date
      links {
        title
        type
        url
        comment
      }
    }
  }
`

export default Bulletin
