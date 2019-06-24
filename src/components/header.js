import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Toolbar from '@material-ui/core/Toolbar'
import { makeStyles } from '@material-ui/core/styles'

import SeaEye from './seaeye'
import Nav from './nav'

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: '1px solid lightgrey',
    backgroundColor: 'white',
    flexGrow: 1,
  },
  link: {
    marginLeft: theme.spacing(2),
    color: 'black',
    textDecoration: 'none',
    fontVariant: 'all-small-caps',
    whiteSpace: 'nowrap'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  sea: {
    color: theme.palette.primary.main,
  },
  chess: {
    color: '#2255CC'
  }
}))


function Header({ location, siteTitle }) {
  const classes = useStyles()
  const [sea, chess] = siteTitle.split(' ')

  return (
    <AppBar position="fixed" color="default" elevation={0} className={classes.root}>
      <Container maxWidth="md">
        <Toolbar variant="dense" disableGutters={true}>
          <SeaEye />
          <Typography variant="h6" component="span" color="inherit" className={classes.title}>
            <Link to="/" className={classes.link}>
              {/* {siteTitle} */}
              <span className={classes.sea}>{sea}</span>
              <span className={classes.chess}>{chess}</span>
            </Link>
          </Typography>
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
