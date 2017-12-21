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

class App extends Component {
  constructor () {
    super()
  }

  componentWillMount () {
    if (this.props.swap.length) {
      this.props.restorePolling(this.props.swap, this.props.mocking)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    // if (prevState.mq.lg && !this.state.mq.lg) {
    //   toastr.confirm(null, {
    //     disableCancel: true,
    //     component: () => (
    //       <div style={{ padding: 10, color: 'black' }}>
    //         The portfolio is only optimized for large screens at this time. Support for smaller screens is in progress
    //       </div>
    //     )
    //   })
    // }
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

  _mediaQueryChange (mediaQuery, type) {
    this.setState({ mq: Object.assign({}, this.state.mq, { [type]: mediaQuery.matches }) })
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
  mock: state.mock
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
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(App))
