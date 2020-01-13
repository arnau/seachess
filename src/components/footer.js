import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { Link } from 'gatsby'


const useStyles = makeStyles(theme => ({
  wrapper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  licence: {
    fontSize: '0.9em'
  },
  nav: {
    marginBottom: theme.spacing(2),
  }
}))

function Footer({ className }) {
  const classes = useStyles()
  return (
    <footer className={className}>
      <Container maxWidth="md" className={classes.wrapper}>
        <Typography component="p" className={classes.nav}><Link to="/about/">About</Link></Typography>
        <Typography component="p">Arnau Siches © {new Date().getFullYear()}</Typography>
      </Container>
    </footer>
  )
}

Footer.propTypes = {
  className: PropTypes.string,
}

export default Footer
