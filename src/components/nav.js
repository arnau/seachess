import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { withStyles } from '@material-ui/core/styles'


const STabs = withStyles(theme => ({
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > div': {
      maxWidth: 20,
      width: '100%',
      backgroundColor: theme.palette.primary.main,
    },
  },
}))(props => <Tabs {...props} TabIndicatorProps={{ children: <div /> }} />)

const STab = withStyles(theme => ({
  root: {
    fontWeight: theme.typography.fontWeightRegular,
    minWidth: theme.spacing(10),
    // marginRight: theme.spacing(0),
    '&:focus': {
      opacity: 1,
    },
  },
}))(props => <Tab disableRipple component={Link} {...props} />)

const options = [
  { url: '/notes/', label: 'Notes'},
  { url: '/sketches/', label: 'Sketches'},
  { url: '/bulletins/', label: 'Bulletins'},
  // { url: '/about/', label: 'About'},
]

function Nav({ location }) {
  const llocation = ['/notes/','/sketches/','/bulletins/'].some(x => location == x)
    ? location : false
  return (
    <STabs value={llocation}>
      {
        options.map(({url, label}) => <STab key={url} to={url} value={url} label={label} />)
      }
    </STabs>
  )
}

Nav.propTypes = {
  location: PropTypes.string.isRequired,
}

export default Nav
