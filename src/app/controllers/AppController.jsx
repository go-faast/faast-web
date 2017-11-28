import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import toastr from 'Utilities/toastrWrapper'
import blockstack from 'Utilities/blockstack'
import App from 'Views/App'
import withMockHandling from '../hoc/withMockHandling'
import { restorePolling } from 'Actions/portfolio'
import { setSwap } from 'Actions/redux'

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
  }

  componentWillMount () {
    if (this.props.swap.length) {
      this.props.restorePolling(this.props.swap, this.props.mocking)
    }
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
    if (this.props.wallet.type === 'blockstack' && !isEqual(prevProps.settings, this.props.settings)) {
      blockstack.saveSettings(this.props.settings)
    }
  }

  _mediaQueryChange (mediaQuery, type) {
    this.setState({ mq: Object.assign({}, this.state.mq, { [type]: mediaQuery.matches }) })
  }

  render () {
    return (
      <App />
    )
  }
}

AppController.propTypes = {
  wallet: PropTypes.object.isRequired,
  swap: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  swap: state.swap,
  settings: state.settings
})

const mapDispatchToProps = (dispatch) => ({
  restorePolling: (swap, isMocking) => {
    dispatch(restorePolling(swap, isMocking))
  },
  setSwap: (swap) => {
    dispatch(setSwap(swap))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(AppController))
