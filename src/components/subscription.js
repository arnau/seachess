import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import Mailerlite from '../components/mailerlite'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: '#FFF7E0',
  },
}))


function Subscription() {
  const classes = useStyles()

  return (
    <Paper variant="outlined" className={classes.root}>
      <Typography component="p" paragraph={true}>
        Subscribe to new issues of the bulletin via the <a href="/bulletins/rss.xml">RSS feed</a> or by email.
      </Typography>
      <Mailerlite />
    </Paper>
  )
}

export default Subscription
