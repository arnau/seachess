import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import Page from '../components/page'
import Heading from '../components/heading'
import Link from '../components/link'


function About({ location, data }) {
  const { settings } = data

  return (
    <Page location={location.pathname} title="About">
      <Heading>About</Heading>
      <p>Hi, I'm Arnau Siches; this website is the place where I put some of my <Link
        to="/notes/">notes</Link>, <Link
        to="/sketches/">sketches</Link> and where I keep record of the <Link
        to="/bulletins/">bulletins</Link> I send every week to my subscribers.</p>

      <p>You can find some of my other activity in</p>
      <ul>
        {
          settings.author.accounts.map(account => <li key={account.id}><Link
            href={account.url}>{account.service_name}</Link></li>)
        }
      </ul>

      <h2>About this website</h2>
      <p>This website works thanks to the impressive work done by many people
          contributing to the Open Source ecosystem. A few worthwhile
          mentions:</p>

      <ul>
        {
          settings.tools.map(tool => <li key={tool.id}><Link
            href={tool.url}>{tool.name}</Link></li>)
        }
      </ul>

      <h2>Privacy</h2>

      <p>This website uses <a
        href="https://panelbear.com/docs/what-we-collect/">Panel Bear</a> to collect anonymous usage.</p>

    </Page>
  )
}

About.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query About {
    settings {
      title
      author {
        name
        accounts {
          id
          service_name
          url
        }
      }
      tools {
        id
        name
        url
      }

    }
  }
`
export default About
