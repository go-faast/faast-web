import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import blockstack from 'Utilities/blockstack'
import { statusAllSwaps } from 'Utilities/swap'
import AppView from './view'
import { restoreSwapPolling } from 'Actions/portfolio'
import { setBreakpoints } from 'Actions/redux'
import { postSwundle } from 'Actions/request'
import { breakpointWidths } from 'Utilities/breakpoints'
import { getCurrentWallet, getAllSwapsArray } from 'Selectors'

class App extends Component {
  constructor () {
    super()
    this._mediaQueryChange = this._mediaQueryChange.bind(this)
  }

  componentWillMount () {
    if (this.props.swaps.length) {
      this.props.restoreSwapPolling(this.props.swaps)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.wallet.isBlockstack && !isEqual(prevProps.settings, this.props.settings)) {
      blockstack.saveSettings(this.props.settings)
    }
    const statusPrevSwap = statusAllSwaps(prevProps.swaps)
    const statusCurrSwap = statusAllSwaps(this.props.swaps)
    if (statusPrevSwap !== 'pending_receipts' && statusCurrSwap === 'pending_receipts') {
      this.props.postSwundle(this.props.wallet.address, this.props.swaps)
    } else if (statusPrevSwap !== 'pending_receipts_restored' && statusCurrSwap === 'pending_receipts_restored') {
      this.props.restoreSwapPolling(this.props.swaps)
    }
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
  wallet: getCurrentWallet(state),
  swaps: getAllSwapsArray(state),
  settings: state.settings,
  mq: state.mediaQueries
})

const mapDispatchToProps = {
  restoreSwapPolling,
  postSwundle,
  setBreakpoints
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
