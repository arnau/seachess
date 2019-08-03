import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
// import urljoin from "url-join";


function Meta({ description, meta, title }) {
  const { settings } = useStaticQuery(
    graphql`
      query MetaQuery {
        settings {
          title
          description
          author {
            name
            twitter { name }
          }
        }
      }
    `
  )

  const metaDescription = description || settings.description
  const metadata = {
    description: metaDescription,
    'twitter:card': 'summary',
    'twitter:creator': settings.author.twitter.name,
    'twitter:title': title,
    'twitter:description': metaDescription,
    'og:title': title,
    'og:description': metaDescription,
  }

  return (
    <Helmet
      htmlAttributes={{lang: 'en'}}
      title={title}
      titleTemplate={`%s | ${settings.title}`}
      meta={Object.entries({ ...metadata, ...meta}).map(([name, content]) => ({name, content}))}
    >
      {
        //<link rel="stylesheet"
        //href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      }
      {/* <link rel="sitemap" type="application/xml" href="/sitemap.xml" /> */}
    </Helmet>
  )
}

Meta.defaultProps = {
  meta: [],
}

Meta.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.object,
  title: PropTypes.string.isRequired,
}

export default Meta
