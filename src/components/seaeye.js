import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Logo from '../assets/logo.svg'


const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})

function SeaEye() {
  const classes = useStyles()

  return (
    <img src={Logo} alt="" className={classes.root} />
  )
}

export default SeaEye
