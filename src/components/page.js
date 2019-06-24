import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

import Layout from '../components/layout'
import Meta from '../components/meta'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0, 4),
  },
}))

function Page({location, title, children}) {
  const classes = useStyles()

  return (
    <Layout location={location}>
      <Meta title={title} />

      <div className={classes.root}>
        { children }
      </div>
    </Layout>
  )
}

Page.propTypes = {
  location: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.array,
}


export default Page
