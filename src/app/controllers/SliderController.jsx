import React, { Component } from 'react'
import Slider from 'Views/Slider'

class SliderController extends Component {
  constructor (props) {
    super(props)
    this._handleChange = this._handleChange.bind(this)
  }

  _handleChange (value, extra) {
    // const newSlider = Math.round(value * 100)
    // const currentValue = this.props.map[this.props.asset.symbol][this.props.type].adjusted
    // const currentValue = this.props.asset.fiat.adjusted
    // let newValue
    // if (currentValue.plus(this.props.allowance).greaterThan(value)) {
    // // if (newSlider <= currentValue + this.props.allowance) {
    //   newValue = value
    // } else {
    //   // newValue = currentValue + this.props.allowance
    //   newValue = currentValue.plus(this.props.allowance)
    // }
    this.props.onValueChange(this.props.asset.symbol, value)
  }

  render () {
    // const value = this.props.map[this.props.asset.symbol][this.props.type].adjusted
    const value = this.props.asset.fiat.adjusted.toNumber()
    return (
      <Slider
        value={value}
        max={this.props.max}
        onChange={this._handleChange}
      />
    )
  }
}

export default SliderController
