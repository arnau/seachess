import React from 'react'
import PropTypes from 'prop-types'
import MuiLink from '@material-ui/core/Link'
import { Link as GatsbyLink } from 'gatsby'

const Link = React.forwardRef(function Link(props, ref) {
  if (props.href) {
    return <MuiLink ref={ref} {...props} />
  }

  return <MuiLink component={GatsbyLink} ref={ref} {...props} />
})

Link.propTypes = {
  href: PropTypes.string,
}

export default Link
