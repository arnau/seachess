import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(8, 0, 2),
  },
}))



function Licence() {
  const classes = useStyles()

  return (
    <Typography component="p" variant="body2" className={classes.root}>
        Licensed under a <a
        rel="license"
        href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.
    </Typography>
  )
}

export default Licence
