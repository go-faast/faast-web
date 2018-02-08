import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {
  getCurrentPortfolio, isCurrentPortfolioEmpty, areCurrentPortfolioHoldingsLoaded, getCurrentPortfolioHoldingsError
} from 'Selectors'
import { updateHoldings } from 'Actions/portfolio'
import Loading from 'Components/Loading'

class WalletOpened extends React.PureComponent {

  componentWillMount() {
    this._updateHoldings()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.wallet.id && nextProps.wallet.id !== this.props.wallet.id) {
      this._updateHoldings()
    }
  }

  _updateHoldings () {
    this.props.updateHoldings(this.props.wallet.id)
  }

  render() {
    const { isEmpty, walletHoldingsLoaded, walletHoldingsError, path, component: Component } = this.props
    return (
      <Route path={path} render={props => (
        !isEmpty
          ? (!walletHoldingsLoaded
            ? (<Loading center error={walletHoldingsError}/>)
            : (<Component {...props} />))
          : (<Redirect to='/' />)
      )} />
    )
  }
}

WalletOpened.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: getCurrentPortfolio(state),
  isEmpty: isCurrentPortfolioEmpty(state),
  walletHoldingsLoaded: areCurrentPortfolioHoldingsLoaded(state),
  walletHoldingsError: getCurrentPortfolioHoldingsError(state),
})

const mapDispatchToProps = {
  updateHoldings
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletOpened)
