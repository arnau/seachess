import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import NoSsr from '@material-ui/core/NoSsr'

import CookieDialog from './cookiedialog'


const useStyles = makeStyles(theme => ({
  wrapper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}))

function Footer({ className }) {
  const classes = useStyles()
  return (
    <footer className={`${classes.wrapper} ${className}`}>
      <Typography component="p">Arnau Siches © {new Date().getFullYear()}</Typography>
      <NoSsr defer={true}>
        <CookieDialog />
      </NoSsr>
    </footer>
  )
}

Footer.propTypes = {
  className: PropTypes.string,
}

export default Footer
