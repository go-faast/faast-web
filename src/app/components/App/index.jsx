import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import toastr from 'Utilities/toastrWrapper'
import blockstack from 'Utilities/blockstack'
import { statusAllSwaps } from 'Utilities/swap'
import AppView from './view'
import withMockHandling from 'Hoc/withMockHandling'
import { restorePolling } from 'Actions/portfolio'
import { setSwap } from 'Actions/redux'
import { postSwundle } from 'Actions/request'
import {setMediaQueries} from '../../actions/redux'

const widths = new Map()
widths.set('smPh', '(max-width: 320px)')
widths.set('mdPh', '(max-width: 375px)')
widths.set('lgPh', '(max-width: 425px)')
widths.set('sm', '(min-width: 768px)')
widths.set('md', '(min-width: 992px)')
widths.set('lg', '(min-width: 1200px)')

class App extends Component {
  constructor () {
    super()
    this._mediaQueryChange = this._mediaQueryChange.bind(this)
  }

  componentWillMount () {
    if (this.props.swap.length) {
      this.props.restorePolling(this.props.swap, this.props.mocking)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const largePhone = this.props.mq.lgPh && !this.props.mq.mdPh && !this.props.mq.smPh

    if (prevProps.mq.lg && !largePhone) {
      toastr.confirm(null, {
        disableCancel: true,
        component: () => (
          <div style={{ padding: 10, color: 'black' }}>
            The portfolio is only optimized for large screens at this time. Support for smaller screens is in progress
          </div>
        )
      })
    }
    if (this.props.wallet.type === 'blockstack' && !isEqual(prevProps.settings, this.props.settings)) {
      blockstack.saveSettings(this.props.settings)
    }
    const statusPrevSwap = statusAllSwaps(prevProps.swap)
    const statusCurrSwap = statusAllSwaps(this.props.swap)
    if (statusPrevSwap !== 'pending_receipts' && statusCurrSwap === 'pending_receipts') {
      this.props.postSwundle(this.props.wallet.address, this.props.swap)
    } else if (statusPrevSwap !== 'pending_receipts_restored' && statusCurrSwap === 'pending_receipts_restored') {
      this.props.restorePolling(this.props.swap, this.props.mock.mocking)
    }
  }

  componentDidMount () {
    widths.forEach((value, key) => {
      this._mediaQueryChange(window.matchMedia(value), key)
      window.matchMedia(value).addListener((e) => { this._mediaQueryChange(e, key) })
    })
  }

  _mediaQueryChange (mq, type) {
    this.props.setMediaQueries({ [type]: mq.matches })
  }

  render () {
    return (
      <AppView />
    )
  }
}

App.propTypes = {
  wallet: PropTypes.object.isRequired,
  swap: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  swap: state.swap,
  settings: state.settings,
  mock: state.mock,
  mq: state.mediaQueries
})

const mapDispatchToProps = (dispatch) => ({
  restorePolling: (swap, isMocking) => {
    dispatch(restorePolling(swap, isMocking))
  },
  setSwap: (swap) => {
    dispatch(setSwap(swap))
  },
  postSwundle: (address, swap) => {
    dispatch(postSwundle(address, swap))
  },
  setMediaQueries: (mq) => {
    dispatch(setMediaQueries(mq))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(App))
