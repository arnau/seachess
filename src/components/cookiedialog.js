import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import CookieContext from '../context'
import bitflag from '../bitflag'


const useParaStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1, 0)
  },
}))

function Para({ children }) {
  const classes = useParaStyles()
  return (
    <Typography component="p" variant="body2" classes={classes}>{children}</Typography>
  )
}
Para.propTypes = {
  children: PropTypes.node.isRequired,
}

function Flag({checked, onChange, children, className}) {
  return (
    <FormControlLabel
      className={className}
      control={
        <Switch checked={checked} onChange={onChange} />
      }
      label={children}
    />
  )
}

Flag.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}


function ConfirmationDialogRaw({open, onClose, settings, setSettings}) {
  const classes = useStyles()
  const analytics = bitflag.isActive(settings, 1)
  const handleAnalytics = () => { setSettings(bitflag.flip(settings, 1)) }

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={open}
    >
      <DialogTitle id="confirmation-dialog-title">Cookies settings</DialogTitle>
      <DialogContent dividers>
        <Para>
          We would like to set Google Analytics cookies to help us to improve our
          website by collecting information on how you use it.
          Google Analytics cookies store anonymised information.
        </Para>

        <Flag
          className={classes.switch}
          checked={analytics}
          onChange={handleAnalytics}>Analytics cookies</Flag>

        <Para>
          You can always change these preferences using the "Cookies
          settings" button at the footer of this website.
        </Para>
        <Para>
          If you want to know more about why we need your explicit consent,
          you can get detailed information at <Link
            href="https://ico.org.uk/for-organisations/guide-to-pecr/guidance-on-the-use-of-cookies-and-similar-technologies/">ICO's guide</Link>.
        </Para>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Save settings
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmationDialogRaw.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  setSettings: PropTypes.func.isRequired,
  settings: PropTypes.number.isRequired,
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  paper: {
    width: '80%',
    maxHeight: 435,
  },
  switch: {
    margin: theme.spacing(2, 0),
  },
  trigger: {
    margin: theme.spacing(2, 0),
  }
}))

export default function CookieDialog() {
  const classes = useStyles()
  const {settings, setSettings, cookieEnabled} = React.useContext(CookieContext)
  const open = bitflag.isActive(settings, 0)

  function handleOpen() {
    setSettings(bitflag.activate(settings, 0))
  }

  function handleClose() {
    setSettings(bitflag.deactivate(settings, 0), true)
  }

  return (
    cookieEnabled
      ? (<React.Fragment>
        <Button
          className={classes.trigger}
          variant="outlined"
          color="primary"
          onClick={handleOpen}>Cookies settings</Button>

        <ConfirmationDialogRaw
          classes={ {paper: classes.paper} }
          id="ringtone-menu"
          keepMounted
          settings={settings}
          setSettings={setSettings}
          open={open}
          onClose={handleClose}
        />
      </React.Fragment>)
      : null
  )
}
