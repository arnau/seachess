import React from 'react'

import Layout from '../components/layout'
import Meta from '../components/meta'

function NotFoundPage() {
  return (
    <Layout>
      <Meta title="404: Not found" />
      <h1>Not found</h1>
      <p>You just hit a route that doesn't exist... the sadness.</p>
    </Layout>
  )
}

export default NotFoundPage
