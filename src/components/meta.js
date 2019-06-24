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
          author { name }
        }
      }
    `
  )

  const metaDescription = description || settings.description

  return (
    <Helmet
      htmlAttributes={{lang: 'en'}}
      title={title}
      titleTemplate={`%s | ${settings.title}`}
      meta={[
        {
          name: 'description',
          content: metaDescription,
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:creator',
          content: settings.author.name,
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: metaDescription,
        },
      ].concat(meta)}
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
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default Meta
