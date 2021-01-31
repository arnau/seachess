import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
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
            accounts {
              id
              name
            }
          }
        }
      }
    `
  )

  const metaDescription = description || settings.description
  const twitter = settings.author.accounts.find(({id}) => id == 'twitter')
  const metadata = {
    description: metaDescription,
    'twitter:card': 'summary',
    'twitter:creator': twitter.name,
    'og:title': title,
    'og:description': metaDescription,
  }

  const metaset = Object.entries({ ...metadata, ...meta}).map(([name, content]) => {
    const obj = name.startsWith('og') ? {property: name, content} : {name, content}

    return obj
  })

  return (
    <Helmet
      htmlAttributes={{lang: 'en'}}
      title={title}
      titleTemplate={`%s | ${settings.title}`}
      meta={metaset}>
      {/* <link rel="sitemap" type="application/xml" href="/sitemap.xml" /> */}
    </Helmet>
  )
}

Meta.defaultProps = {
  meta: {},
}

Meta.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.object,
  title: PropTypes.string.isRequired,
}

export default Meta
