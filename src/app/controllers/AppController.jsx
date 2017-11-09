import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import App from 'Views/App'
import withMockHandling from '../hoc/withMockHandling'
import log from 'Utilities/log'
import { sessionStorageClear, statusAllSwaps } from 'Utilities/helpers'
import { resetAll, resetSwap } from 'Actions/redux'

const widths = new Map()
widths.set('sm', '(min-width: 768px)')
widths.set('md', '(min-width: 992px)')
widths.set('lg', '(min-width: 1200px)')

class AppController extends Component {
  constructor () {
    super()
    this.state = {
      mq: {
        sm: true,
        md: true,
        lg: true
      }
    }
    this._closeWallet = this._closeWallet.bind(this)
    this._handleBack = this._handleBack.bind(this)
  }

  componentDidMount () {
    widths.forEach((value, key) => {
      this._mediaQueryChange(window.matchMedia(value), key)
      window.matchMedia(value).addListener((e) => { this._mediaQueryChange(e, key) })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.mq.lg && !this.state.mq.lg) {
      toastr.confirm(null, {
        disableCancel: true,
        component: () => (
          <div style={{ padding: 10, color: 'black' }}>
            The portfolio is only optimized for large screens at this time. Support for smaller screens is in progress
          </div>
        )
      })
    }
  }

  _mediaQueryChange (mediaQuery, type) {
    this.setState({ mq: Object.assign({}, this.state.mq, { [type]: mediaQuery.matches }) })
  }

  _closeWallet () {
    sessionStorageClear()
    this.props.resetAll()
    log.info('wallet closed')
  }

  _handleBack () {
    if (this.state.view === 'swap') {
      this.setState({ view: 'balances' })
      this.props.resetSwap()
    } else if (this.state.view === 'orders') {
      switch (statusAllSwaps(this.props.swap)) {
        case 'unsigned':
          this.setState({ view: 'edit' })
          break
        case 'pending':
          this.setState({ view: 'balances' })
          break
        case 'finalized':
          this.setState({ view: 'balances' })
          this.props.resetSwap()
      }
    }
  }

  render () {
    let initialValues = {}
    if (this.props.swap.length) {
      this.props.swap.forEach((s) => {
        s.list.forEach((r) => {
          initialValues[`${s.symbol}_${r.symbol}`] = r.unit.number
        })
      })
    }
    return (
      <App />
    )
  }
}

AppController.propTypes = {
  swap: PropTypes.array.isRequired,
  resetAll: PropTypes.func.isRequired,
  resetSwap: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  swap: state.swap
})

const mapDispatchToProps = (dispatch) => ({
  resetAll: () => {
    dispatch(resetAll())
  },
  resetSwap: () => {
    dispatch(resetSwap())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(AppController))
