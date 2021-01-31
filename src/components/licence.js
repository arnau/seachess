import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useStaticQuery, graphql } from 'gatsby'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(8, 0, 2),
  },
}))



function Licence() {
  const classes = useStyles()
  const { settings } = useStaticQuery(graphql`
    query Licence {
      settings {
        licence {
          name
          url
        }
      }
    }
  `)

  return (
    <Typography component="p" variant="body2" className={classes.root}>
        Licensed under a <a
        rel="license"
        href={settings.licence.url}>{settings.licence.name}</a>.
    </Typography>
  )
}

export default Licence
