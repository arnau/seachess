import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import ExcerptNote from '../components/excerptnote'
import Heading from '../components/heading'
import Page from '../components/page'
import Subscription from '../components/subscription'

function Bulletins({location, data}) {
  const set = data.allBulletin.edges
  const { settings } = data

  return (
    <Page location={location.pathname} title="Bulletins">
      <Heading>Bulletins</Heading>
      <Subscription />
      {
        set.map(({node}) => {
          return (
            <ExcerptNote key={node.id}
              title={node.title}
              href={node.slug}
              date={node.date}
              author={settings.author.name}/>
          )
        })
      }
    </Page>
  )
}

Bulletins.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Bulletins {
    settings {
      author { name }
    }
    allBulletin(sort: { fields: date, order: DESC }) {
      edges {
        node {
          id
          slug
          title
          date
          introduction
        }
      }
    }
  }
`
export default Bulletins
