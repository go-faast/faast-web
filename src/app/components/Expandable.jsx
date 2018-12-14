import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { UncontrolledTooltip, Tooltip } from 'reactstrap'
import { tag as tagPropType } from 'Utilities/propTypes'

class Expandable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: `expandable-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`
    }
  }

  render () {
    const { tag: Tag, expanded, shrunk, id: propId, placement, ...props } = this.props
    const id = propId || this.state.id
    return (
      <Tag {...props}>
        {shrunk !== expanded ? ([
          <span key='shrunk' id={id}>{shrunk}</span>,
          <UncontrolledTooltip key='expanded' target={id} autohide={false} placement={placement}>
            {expanded}
          </UncontrolledTooltip>
        ]) : shrunk}
      </Tag>
    )
  }
}

Expandable.propTypes = {
  expanded: PropTypes.node.isRequired,
  shrunk: PropTypes.node.isRequired,
  tag: tagPropType,
  placement: Tooltip.propTypes.placement,
}

Expandable.defaultProps = {
  tag: 'span'
}

export default Expandable
