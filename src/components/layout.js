import React from 'react'
import PropTypes from 'prop-types'
import { useStaticQuery, graphql } from 'gatsby'
import 'typeface-roboto'
import '../prism-theme.css'
import '../main.css'

import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'

import Header from './header'
import Footer from './footer'
import theme from '../theme'

const useStyles = makeStyles(theme => ({
  wrapper: {
    backgroundColor: '#FAFAFA',
  },
  links: {
    '@global': {
      'a': {
        color: theme.palette.primary.main,
        textDecoration: 'underline'
      },
      'a:visited': {
        color: theme.palette.primary.visited,
      }
    },

  }
}))


function Wrapper({ location, children, maxWidth }) {
  const classes = useStyles()
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      settings {
        title,
      }
    }
  `)

  return (
    <React.Fragment>
      <Header location={location} siteTitle={data.settings.title} />
      <div className={`${classes.wrapper} ${classes.links}`} vocab="http://schema.org/">
        <Container maxWidth={maxWidth || 'md'}>
          <main>{children}</main>
        </Container>
      </div>
      <Footer className={classes.links} />
    </React.Fragment>
  )
}

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
}

function Layout({ location, children, maxWidth }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Wrapper location={location} maxWidth={maxWidth}>{children}</Wrapper>
    </ThemeProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
}

export default Layout
