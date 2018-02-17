import React, { Component } from 'react'
import SliderView from './view'

class Slider extends Component {
  constructor (props) {
    super(props)
    this._handleChange = this._handleChange.bind(this)
  }

  _handleChange (value) {
    const { onValueChange, walletId, asset } = this.props
    onValueChange(walletId, asset.symbol, value)
  }

  render () {
    const { asset, max } = this.props
    const value = asset.fiat.adjusted.toNumber()
    return (
      <SliderView
        value={value}
        max={max}
        onChange={this._handleChange}
      />
    )
  }
}

export default Slider
