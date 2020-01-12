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
      <p>My name is Arnau Siches; this website is the place where I put some of my <Link
        to="/notes/">notes</Link> and <Link
        to="/sketches/">sketches</Link>.</p>

      <p>You can find some of my other activity in {' '}
        <Link href={settings.author.github.url}>GitHub</Link>, {' '}
        <Link href={settings.author.keybase.url}>Keybase</Link> and {' '}
        <Link href={settings.author.twitter.url}>Twitter</Link>.</p>

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

      <h2>Cookie usage</h2>

      <p>This website doesn't use cookies anymore. Originally it used Google
        Analytics to gather minimal information on what routes were hit,
        the same information you would get from server side logs, because
        Netlify doesn't offer this information in their free plan.</p>

      <p>This required to add an infamous cookie wall as imposed by ICO and
        firends. The "solution" to put users in control of their privacy.
        Laughable. On top of that, people are starting shame you if you use
        cookies. Great one! now people that want to use cookies with honest
        purposes have to justify themselves and people that use them for shady
        purposes will carry on because they couldn't care less. Well done data
        privacy zealous guardians. Well done.</p>

      <h2>What's up with this silly name</h2>

      <p>
        <strong>seachess</strong> kind of sounds like my surname <strong>siches</strong> and well, {' '}
          I like silly names. Previous incarnations of this website had other silly names: {' '}
        <code>artnau.com</code>, {' '}
        <code>arenoic.net</code>, {' '}
        <code>esbudellat.net</code> and {' '}
        <code>spoontaneous.net</code>.
      </p>
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
        github {
          name
          url
        }
        twitter {
          name
          url
        }
        keybase {
          name
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
