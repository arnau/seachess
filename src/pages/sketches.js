import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Gallery from 'react-photo-gallery'

import Link from '../components/link'
import Page from '../components/page'
import Heading from '../components/heading'

function Thumbnail({ photo, margin, key }) {
  const imgStyle = { margin: margin, display: 'block' }

  return (
    <Link to={`/sketches/${photo.id}`} key={key}>
      <img
        style={imgStyle}
        src={photo.src}
        alt={photo.alt}
        srcSet={photo.srcSet}
        sizes={photo.sizes}
        width={photo.width}
        height={photo.height}
      />
    </Link>
  )
}

Thumbnail.propTypes = {
  photo: PropTypes.object,
  margin: PropTypes.number,
  key: PropTypes.any,
}

function List({ set }) {
  return (
    <Gallery
      photos={set.map(({ node }) => {
        const { src, srcSet, sizes, aspectRatio } = node.image.childImageSharp.fluid

        return ({
          id: node.id,
          src,
          alt: node.caption,
          srcSet,
          sizes,
          width: 250,
          height: 250 / aspectRatio
        })
      })}
      renderImage={Thumbnail}
      direction="row" />
  )
}

List.propTypes = {
  set: PropTypes.array.isRequired,
}

function Sketches({location, data}) {
  const set = data.allSketch.edges

  return (
    <Page location={location.pathname} title="Sketches">
      <Heading>Sketches</Heading>
      <List set={set}/>
    </Page>
  )
}

Sketches.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Sketches {
    allSketch(sort: { fields: [date], order: DESC }) {
      edges {
        node {
          id
          date
          caption
          image {
            childImageSharp {
              fluid(fit: CONTAIN, maxWidth: 250) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`
export default Sketches
