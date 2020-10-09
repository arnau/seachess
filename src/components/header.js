import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Toolbar from '@material-ui/core/Toolbar'

import SeaEye from './seaeye'
import Nav from './nav'

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: '1px solid lightgrey',
    backgroundColor: 'white',
    flexGrow: 1,
  },
  link: {
    display: 'inline-block',
    color: 'black',
    textDecoration: 'none',
    fontVariant: 'all-small-caps',
    whiteSpace: 'nowrap'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  group: {
    flexGrow: 1,
  },
}))

function Brand({ classes, title }) {
  return (
    <Typography variant="h6" component="span" color="inherit"
      className={classes.group}>
      <Link to="/" className={classes.link}>
        <SeaEye />
        <span className="brand-text">{title}</span>
      </Link>
    </Typography>
  )
}

Brand.propTypes = {
  title: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
}

function Header({ location, siteTitle }) {
  const classes = useStyles()

  return (
    <AppBar position="static" color="default" elevation={0} className={classes.root}>
      <Container maxWidth="md">
        <Toolbar variant="dense" disableGutters={true}>
          <Brand classes={classes} title={siteTitle} />
          <Nav location={location} />
        </Toolbar>
      </Container>
    </AppBar>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
  location: PropTypes.string.isRequired,
}

export default Header
