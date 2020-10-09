import React from 'react'
import PropTypes from 'prop-types'
import markdown from 'remark-parse'
import rehype2react from 'rehype-react'
import remark2rehype from 'remark-rehype'
import unified from 'unified'

const processor = unified()
  .use(markdown)
  .use(remark2rehype)
  .use(rehype2react, { createElement: React.createElement })

function Md({ raw }) {
  const result = processor.processSync(raw)

  return (
    <React.Fragment>
      {result.contents}
    </React.Fragment>
  )
}

Md.propTypes = {
  raw: PropTypes.string.isRequired,
}


export default Md
