import dayjs from 'dayjs'
import React from 'react'
import PropTypes from 'prop-types'

function PublicationDate({date}) {
  const instant = dayjs(date)
  const iso = instant.format('YYYY-MM-DD')

  return (
    <span property="datePublished" content={iso}>
      <time dateTime={iso}>{instant.format('MMMM D, YYYY')}</time>
    </span>
  )
}

PublicationDate.propTypes = {
  date: PropTypes.string,
}

function MetaNote({date, author, className, children}) {
  return (
    <div className={className}>
      On <PublicationDate date={date} /> by <span property="creator">{author}</span>.
      {/* <a href={slug} itemProp="url" title={title}>#</a> */}
      { ' ' }
      { children }
    </div>
  )
}

MetaNote.propTypes = {
  date: PropTypes.string,
  author: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
}

export default MetaNote
