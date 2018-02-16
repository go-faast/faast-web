import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { UncontrolledTooltip } from 'reactstrap'

class Expandable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: props.id || `expandable-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`
    }
  }

  render () {
    const { expanded, shrunk } = this.props
    const { id } = this.state
    return (
      <span>
        <span id={id}>{shrunk}</span>
        <UncontrolledTooltip target={id} autohide={false}>
          {expanded}
        </UncontrolledTooltip>
      </span>
    )
  }
}

Expandable.propTypes = {
  id: PropTypes.string,
  expanded: PropTypes.node.isRequired,
  shrunk: PropTypes.node.isRequired,
}

Expandable.defaultProps = {
  id: null,
}

export default Expandable
