import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import Layout from '../components/layout'
import Meta from '../components/meta'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 0, 4),
  },
}))


function NotFoundPage() {
  const classes = useStyles()
  return (
    <Layout location="/404">
      <div className={classes.root}>
        <Meta title="Not found" />
        <Typography component="h1" variant="h2">Page not found</Typography>
        <p>The page you are trying to access does not exist.</p>
      </div>
    </Layout>
  )
}

export default NotFoundPage
