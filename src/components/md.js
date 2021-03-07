import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'

function Md({ raw }) {
  return (
    <ReactMarkdown>
      {raw}
    </ReactMarkdown>
  )
}


Md.propTypes = {
  raw: PropTypes.string.isRequired,
}


export default Md
