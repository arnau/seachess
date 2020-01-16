import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import SnackbarContent from '@material-ui/core/SnackbarContent'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: '#FFF7E0'
  },
  error: {
    marginTop: theme.spacing(3),
    backgroundColor: '#C04',
  },
  form: {
  },
  input: {
    fontSize: 12,
    marginTop: theme.spacing(0),
    marginRight: theme.spacing(1),
    backgroundColor: '#FFF'
  },
  submit: {
    paddingTop: '8px',
    paddingBottom: '7px',
  },
}))


function Form({ classes, code, action, onSubmit, value, setValue }) {
  const [disabled, setDisabled] = useState(true)
  const handleChange = (event) => {
    const value = event.target.value
    const hasAd = value.indexOf('@') != -1
    const startsWithAd = value.startsWith('@')
    const endsWithAd = value.endsWith('@')

    setValue(value)

    hasAd && !startsWithAd && !endsWithAd
      ? setDisabled(false)
      : setDisabled(true)
  }

  return (
    <form
      action={action}
      method="post"
      className={classes.form}
      autoComplete="off"
      data-code={code}
      onSubmit={onSubmit}>

      <TextField
        type="email"
        className={classes.input}
        id="bulletin-email"
        name="fields[email]"
        label="Email"
        margin="dense"
        variant="outlined"
        data-inputmask=""
        value={value}
        onChange={handleChange}
      />

      <input type="hidden" name="ml-submit" value="1" />

      <Button
        type="submit"
        disabled={disabled}
        className={classes.submit}
        variant="contained"
        color="primary"
        disableElevation>Subscribe</Button>

    </form>
  )
}

Form.propTypes = {
  classes: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  onSubmit: PropTypes.any,
  value: PropTypes.string,
  setValue: PropTypes.any,
}

function Mailerlite() {
  const code = 'q2f6f6'
  const action = `https://app.mailerlite.com/webforms/submit/${code}`
  const [status, setStatus] = useState('ready')
  const [value, setValue] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('hi')
    setStatus('sending')

    fetch(action, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `fields[email]=${encodeURIComponent(value)}&ml-submit=1`
    })
      .then(() => {
        setStatus('sent')
      })
      .catch((error) => {
        console.log(error)
        setStatus('error')
      })
  }

  const classes = useStyles()

  if (status == 'ready') {
    return (
      <Form
        code={code}
        action={action}
        classes={classes}
        onSubmit={handleSubmit}
        value={value}
        setValue={setValue}
      />
    )
  }

  if (status == 'sending') {
    return (
      <React.Fragment>
        <Typography component="p" paragraph={true}>
          Sending subscription to <a href="https://www.mailerlite.com">Mailerlite</a>.
        </Typography>
        <LinearProgress color="secondary" />
      </React.Fragment>
    )
  }

  if (status == 'sent') {
    return (
      <React.Fragment>
        <Typography component="p" paragraph={true}>
        Thank you for subscribing to the bulletin.
        </Typography>
        <LinearProgress value={100} variant="determinate" />
      </React.Fragment>
    )
  }

  if (status == 'error') {
    return (
      <React.Fragment>
        <Form
          code={code}
          action={action}
          classes={classes}
          onSubmit={handleSubmit}
          value={value}
          setValue={setValue}
        />
        <SnackbarContent
          variant="outlined"
          className={classes.error}
          message="Something went wrong. Try again later." />
      </React.Fragment>
    )
  }
  // <img src="https://track.mailerlite.com/webforms/o/1715020/q2f6f6?v4a60e9ef938a7fa0240ac9ba567062cb" width="1" height="1" style="max-width:1px;max-height:1px;visibility:hidden;padding:0;margin:0;display:block" alt="." border="0" />
}

export default Mailerlite
