import React from 'react'


function Anchor() {
  const side = 6
  const dim = (side * 2) + 5

  const hlight = 'grey'
  const secondary = 'grey'

  return(
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0" y="0"
      width={dim} height={dim}
      viewBox={`0, 0, ${dim}, ${dim}`}
    >
      <title>Anchor</title>

      <g transform="rotate(-45, 8, 7)">
        <rect width={side} height={side} x={2} y={1} fill={hlight} strokeWidth="0" />
        <rect width={side} height={side} x={2 + side} y={1 + side} fill={secondary} strokeWidth="0" />
      </g>
    </svg>
  )
}

export default Anchor
