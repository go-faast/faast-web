import React, { Component } from 'react'
import { Tooltip } from 'reactstrap'

class Expandable extends Component {
  constructor () {
    super()
    this.state = {
      expanded: false,
      tooltipOpen: false
    }
    this._expand = this._expand.bind(this)
    this._shrink = this._shrink.bind(this)
    this._toggleTooltip = this._toggleTooltip.bind(this)
  }

  _expand () {
    this.setState({ expanded: true })
  }

  _shrink () {
    this.setState({ expanded: false })
  }

  _toggleTooltip () {
    if (!this.state.expanded && this.props.expanded !== this.props.shrunk) this.setState({ tooltipOpen: !this.state.tooltipOpen })
  }

  render () {
    const value = this.state.expanded ? this.props.expanded : this.props.shrunk
    return (
      <span>
        <span id={this.props.id} onClick={this._expand}>{value}{!!this.props.extra && this.props.showExtra && <span>&nbsp;{this.props.extra}</span>}</span>
        <Tooltip isOpen={this.state.tooltipOpen} toggle={this._toggleTooltip} target={this.props.id}>
          {this.props.expanded}
        </Tooltip>
      </span>
    )
  }
}

Expandable.defaultProps = {
  showExtra: true
}

export default Expandable
