import * as React from 'react'
import { compose, setDisplayName, withHandlers, setPropTypes } from 'recompose'
import { Button } from 'reactstrap'
import PropTypes from 'prop-types'

import ReactGA from 'react-ga'

export default compose(
  setDisplayName('GAEventButton'),
  setPropTypes({
    event: PropTypes.object
  }),
  withHandlers({
    handleCreateEvent: ({ event }) => (providedOnClick) => {
      if (event) ReactGA.event(event)
      if (providedOnClick) providedOnClick()
    }
  })
)(({ tag: Tag = Button, children, handleCreateEvent, onClick, ...props }) => (
  <Tag onClick={() => handleCreateEvent(onClick)} {...props}>
    {children}
  </Tag>
))