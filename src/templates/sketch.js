import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'
import Img from 'gatsby-image'
import moment from 'moment'

import Link from '../components/link'
import Layout from '../components/layout'

function Tool({ id, name, url }) {
  return (
    url
      ? <Link key={id} href={url}>{name}</Link>
      : <span key={id}>{name}</span>
  )
}

Tool.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
}

function Tools({ set }) {
  const size = set.length - 1

  return (
    set.reduce((acc, tool, index) => {
      acc.push(<Tool key={tool.id} {...tool} />)

      if (index == size - 1) {
        acc.push(' and ')
      } else if (index < size) {
        acc.push(', ')
      }

      return acc
    }, [])
  )
}

PublicationDate.propTypes = {
  date: PropTypes.string,
}

function PublicationDate({date}) {
  const instant = moment(date)
  const iso = instant.format('YYYY-MM-DD')

  return (
    <span property="datePublished" content={iso}>
      <time dateTime={iso}>{instant.format('MMMM D, YYYY')}</time>
    </span>
  )
}

PublicationDate.propTypes = {
  date: PropTypes.string,
}

function MetaSketch({ tools, date, className }) {
  return (
    <div className={className}>
      On <PublicationDate date={date} /> using <Tools set={tools} />
    </div>
  )
}

MetaSketch.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string.isRequired,
  tools: PropTypes.array.isRequired,
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0, 6),
  },
  meta: {
    fontSize: 14,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  }
}))

function Sketch({ data }) {
  const classes = useStyles()
  const { sketch }= data
  const { fluid } = sketch.image.childImageSharp
  const width = fluid.aspectRatio > 1 ? 'lg' : 'md'

  return (
    <Layout location="/sketches/" maxWidth={width}>
      <div className={classes.root}>
        <MetaSketch tools={sketch.tools} date={sketch.date} className={classes.meta} />
        <Img alt={sketch.caption} fluid={fluid} />
      </div>
    </Layout>
  )
}

Sketch.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object,
}

/* eslint no-undef: "off" */
export const query = graphql`
  query SketchById($id: String!) {
    sketch(id: { eq: $id }) {
      id
      date
      caption
      tools {
        id
        name
        url
      }
      image {
        childImageSharp {
          fluid(fit: CONTAIN, maxWidth: 1216) {
            ...GatsbyImageSharpFluid
            originalImg
          }
        }
      }
    }
  }
`

export default Sketch
