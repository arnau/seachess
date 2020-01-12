import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'


const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})

function Square({ side, x, y, fill, stroke }) {
  return (
    <rect width={side} height={side} x={x} y={y} fill={fill} stroke={stroke} />
  )
}

Square.propTypes = {
  side: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired,
}



function SeaEye() {
  const side = 8
  const dim = (side * 4) + 2

  const primary = '#00AAFF'
  const secondary = '#0055AA'
  const neutral = '#55CCEE'
  const hlight = '#FFDD00'
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

      {/* row 1 */}
      <rect width={side} height={side} x={1} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1} fill={primary} stroke={neutral} />
      {/*
      <rect width={side} height={side} x={1 + (side * 4)} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1} fill={primary} stroke={neutral} />
      */}

      {/* row 2 */}
      <rect width={side} height={side} x={1} y={1 + (side * 1)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 1)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 1)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 1)} fill={secondary} stroke={neutral} />
      {/*
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 1)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 1)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 1)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 1)} fill={secondary} stroke={neutral} />
      */}

      {/* row 3 */}
      <rect width={side} height={side} x={1} y={1 + (side * 2)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 2)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 2)} fill={hlight} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 2)} fill={secondary} stroke={neutral} />
      {/*
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 2)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 2)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 2)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 2)} fill={secondary} stroke={neutral} />
      */}

      {/* row 4 */}
      <rect width={side} height={side} x={1} y={1 + (side * 3)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      {/*
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 3)} fill={secondary} stroke={neutral} />
      */}

      {/*

      <rect width={side} height={side} x={1} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 4)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 4)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 4)} fill={primary} stroke={neutral} />

      <rect width={side} height={side} x={1} y={1 + (side * 5)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 5)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 5)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 5)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 5)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 5)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 5)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 5)} fill={secondary} stroke={neutral} />

      <rect width={side} height={side} x={1} y={1 + (side * 6)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 6)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 6)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 6)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 6)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 6)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 6)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 6)} fill={secondary} stroke={neutral} />

      <rect width={side} height={side} x={1} y={1 + (side * 7)} fill={primary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 1)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 2)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 3)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 4)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 5)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 6)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      <rect width={side} height={side} x={1 + (side * 7)} y={1 + (side * 7)} fill={secondary} stroke={neutral} />
      */}
    </svg>
  )
}

export default SeaEye
