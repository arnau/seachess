import React from 'react'
import PropTypes from 'prop-types'

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes} prefix="og: http://ogp.me/ns#">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        {props.headComponents}
        {/*-- Panelbear Analytics - We respect your privacy --*/}
        <script async src="https://cdn.panelbear.com/analytics.js?site=HtfkzMZfG3Z"></script>
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}

        <div
          key={'body'}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />

        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}
