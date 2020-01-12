import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useTheme, makeStyles, withStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'


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
    marginRight: theme.spacing(1),
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
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down('xs'))

  if (matches) { return <NavMenu /> }

  return (
    <STabs value={location}>
      {
        options.map(({url, label}) => <STab key={url} to={url} value={url} label={label} />)
      }
    </STabs>
  )
}

Nav.propTypes = {
  location: PropTypes.string.isRequired,
}


const useStyles = makeStyles(() => ({
  menulink: {
    color: 'black',
    textDecoration: 'none'
  },
}))

function NavMenu() {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <div>
      <IconButton
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {options.map(({url, label}) => (
          <MenuItem key={url} onClick={handleClose}>
            <Link to={url} className={classes.menulink}>{label}</Link>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default Nav
