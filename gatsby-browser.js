/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useCookies } from 'react-cookie'

import CookieContext from './src/context'
import bitflag from './src/bitflag'
import ga from './src/ga'

const gat = ga(window)

function useSettings() {
  const name = 'cookies_settings'
  const {cookieEnabled} = navigator
  const [cookies, setCookie, removeCookie] = useCookies([name])
  const initialState = () => {
    if (!cookieEnabled) {
      return 0
    }

    const value = Number(cookies[name])

    if (isNaN(value)) {
      return 1
    }

    return value
  }

  const [flags, setFlags] = React.useState(initialState)
  const settings = flags
  const options = {
    path: '/',
    expires: new Date('2100'),
    sameSite: 'strict'
  }
  const setSettings = (value, persist=false) => {
    setFlags(value)

    if (cookieEnabled && persist) {
      value
        ? setCookie(name, String(value), options)
        : removeCookie(name, options)

      bitflag.isActive(value, 1)
        ? gat.activate()
        : gat.deactivate(removeCookie)
    }
  }

  return [settings, setSettings]
}

function Wrap({ children }) {
  const {cookieEnabled} = navigator
  const [settings, setSettings] = useSettings()


  if (bitflag.isActive(settings, 1) && !('dataLayer' in window)) {
    gat.activate()
  }

  const ctx = {
    settings,
    setSettings,
    cookieEnabled,
  }

  return (
    <CookieContext.Provider value={ctx}>{children}</CookieContext.Provider>
  )
}

Wrap.propTypes = {
  children: PropTypes.element.isRequired,
}

/* eslint react/prop-types: "off" */
export function wrapRootElement({ element }) {
  return (
    <React.Fragment>
      <Helmet>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gat.trackerId}`}></script>
      </Helmet>
      <Wrap>{element}</Wrap>
    </React.Fragment>
  )
}

export function onRouteUpdate({ location }) {
  if (!('dataLayer' in window)) {
    return null
  }

  // wrap inside a timeout to make sure react-helmet is done with its
  // changes (https://github.com/gatsbyjs/gatsby/issues/11592)
  const sendPageView = () => {
    const pagePath = location
      ? location.pathname + location.search + location.hash
      : undefined

    gat.tag('event', 'page_view', { page_path: pagePath })
  }

  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(() => { requestAnimationFrame(sendPageView) })
  } else {
    // simulate 2 rAF calls
    setTimeout(sendPageView, 32)
  }

  return null
}
