import React, { Component } from 'react'
import { connect } from 'react-redux'
import AppView from './view'
import { setBreakpoints } from 'Actions/redux'
import { breakpointWidths } from 'Utilities/breakpoints'

class App extends Component {
  constructor () {
    super()
    this._mediaQueryChange = this._mediaQueryChange.bind(this)
  }

  componentDidMount () {
    breakpointWidths.forEach((width, breakpoint) => {
      const query = `(min-width: ${width})`
      this._mediaQueryChange(window.matchMedia(query), breakpoint)
      window.matchMedia(query).addListener((e) => { this._mediaQueryChange(e, breakpoint) })
    })
  }

  _mediaQueryChange (mq, type) {
    this.props.setBreakpoints({ [type]: mq.matches })
  }

  render () {
    return (
      <AppView />
    )
  }
}

const mapStateToProps = (state) => ({
  mq: state.mediaQueries
})

const mapDispatchToProps = {
  setBreakpoints
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
