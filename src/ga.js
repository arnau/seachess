/**
/* Google Analytics nonsense to ensure it behaves according to the user consent
 */
export default function ga(window) {
  // GA Tracker Id
  const trackerId = 'UA-143385327-1'

  function tag() {
    window.dataLayer.push(arguments)
  }

  function activate() {
    window[`ga-disable-${trackerId}`] = false
    window.dataLayer = window.__dataLayer || window.dataLayer  || []

    tag('js', new Date())
    tag('config', trackerId, {'anonymize_ip': true})
  }

  function deactivate(removeCookie) {
    window[`ga-disable-${trackerId}`] = true
    window.__dataLayer = window.dataLayer
    delete window.dataLayer

    removeCookie('_ga', {path: '/'})
    removeCookie('_gid', {path: '/'})
    removeCookie(`_gat_gtag_${trackerId.replace(/-/g, '_')}`, {path: '/'})
  }

  return { trackerId, tag, activate, deactivate }
}
