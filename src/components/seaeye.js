import React from 'react'
import { makeStyles } from '@material-ui/core/styles'


const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})

function SeaEye() {
  const base = 6
  const rad = base * 3
  const dim = rad * 2
  const eye = base * 2.4

  const primary = '#FFDD00'
  const secondary = '#000000'
  const classes = useStyles()

  return(
    <svg
      className={classes.root}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0" y="0"
      width={dim} height={dim}
      viewBox={`0, 0, ${dim}, ${dim}`}
    >
      <circle cx={rad} cy={rad} r={rad} fill={secondary} />
      <circle cx={rad} cy={rad} r={eye} fill={primary} />
      <circle cx={rad} cy={rad} r={base} fill={secondary} />
    </svg>

  )
}

export default SeaEye
