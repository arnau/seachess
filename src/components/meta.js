import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
// import urljoin from "url-join";


export function article({url, headline, images, date, author, description}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    headline,
    'image': images,
    'datePublished': date,
    'dateModified': date,
    'author': {
      '@type': 'Person',
      'name': author.name,
    },
    'publisher': {
      '@type': 'Organisation',
      'name': 'Sea Chess',
      'logo': {
        '@type': 'ImageObject',
        'url': '/logo.jpg' // TODO
      }
    },
    description
  }
}


export function breadcrumb(list) {
  return ({
    '@context': 'http://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map(({url, name}) => ({
      '@type': 'ListItem',
      position: 1,
      item: {
        '@id': url,
        name,
      }
    }))
  })
}

export function Snippet(data) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  )
}

function Meta({ description, meta, title }) {
  const { core } = useStaticQuery(
    graphql`
      query {
        core: coreToml {
          title
          description
          author { name }
        }
      }
    `
  )

  const metaDescription = description || core.description

  return (
    <Helmet
      htmlAttributes={{lang: 'en'}}
      title={title}
      titleTemplate={`%s | ${core.title}`}
      meta={[
        {
          name: 'description',
          content: metaDescription,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: metaDescription,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:creator',
          content: core.author.name,
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
    />
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
