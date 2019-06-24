import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(4, 0),
  },
}))


function Heading({children}) {
  const classes = useStyles()

  return (
    <Typography className={classes.root} component="h1" variant="h3">{children}</Typography>
  )
}

Heading.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
}

export default Heading
