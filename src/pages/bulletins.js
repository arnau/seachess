import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { graphql } from 'gatsby'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import dayjs from 'dayjs'

import Md from'../components/md'
import Link from '../components/link'
import Heading from '../components/heading'
import Page from '../components/page'
import Subscription from '../components/subscription'

const useStyles = makeStyles({
  rowId: {
    whiteSpace: 'nowrap'
  },
  date: {
    whiteSpace: 'nowrap'
  }

})

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

function Bulletins({location, data}) {
  const set = data.allIssue.edges
  const classes = useStyles()

  return (
    <Page location={location.pathname} title="Bulletins">
      <Heading>Bulletins</Heading>
      <Subscription />
      <h2>Issues from 2020</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Excerpt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {set.map(({node}) => (
              <TableRow key={node.id}>
                <TableCell component="th" scope="row" className={classes.rowId}>
                  <Link to={node.slug}>
                    {node.id}
                  </Link>
                </TableCell>
                <TableCell className={classes.date}><PublicationDate date={node.publication_date}/></TableCell>
                <TableCell><Md raw={node.summary} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Page>
  )
}

Bulletins.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  pageContext: PropTypes.object,
}


/* eslint no-undef: "off" */
export const query = graphql`
  query Bulletins {
    allIssue(sort: { fields: publication_date, order: DESC }) {
      edges {
        node {
          id
          slug
          publication_date
          summary
        }
      }
    }
  }
`
export default Bulletins
