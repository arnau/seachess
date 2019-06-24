import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import Link from '../components/link'
import MetaNote from '../components/metanote'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
    border: '1px solid #EFEFEF'
  },
  metanote: {
    fontSize: 14,
    marginTop: theme.spacing(2),
  }
}))


function ExcerptNote({title, href, date, author, children}) {
  const classes = useStyles()

  return (
    <Card elevation={0} className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          <Link to={href}>
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </Link>
        </Typography>
        {children}
        <MetaNote date={date} author={author} className={classes.metanote} />
      </CardContent>
    </Card>
  )
}

ExcerptNote.propTypes = {
  title: PropTypes.string,
  href: PropTypes.string,
  date: PropTypes.string,
  author: PropTypes.string,
  children: PropTypes.object,
}

export default ExcerptNote
