import PropTypes from 'prop-types'
import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

function Item({ label, href, isSelected }) {
  return (
    <li>
      <a aria-selected={isSelected} href={href}>
        <span>{label}</span>
      </a>
    </li>

  )
}

Item.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
}


function Nav({ location }) {
  const { settings } = useStaticQuery(graphql`
    query Navigation {
      settings {
        navigation {
          label
          url
        }
      }
    }
  `)
  const { navigation } = settings

  return (
    <nav>
      <ul>
        {
          navigation.map(({url, label}) => <Item key={label} label={label} href={url} isSelected={url == location} />)
        }
      </ul>
    </nav>
  )
}

Nav.propTypes = {
  location: PropTypes.string.isRequired,
}

export default Nav
