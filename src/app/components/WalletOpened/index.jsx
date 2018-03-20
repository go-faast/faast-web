import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import {
  getCurrentPortfolio, isCurrentPortfolioEmpty, areCurrentPortfolioHoldingsLoaded, getCurrentPortfolioHoldingsError
} from 'Selectors'
import { updateHoldings } from 'Actions/portfolio'
import LoadingFullscreen from 'Components/LoadingFullscreen'

class WalletOpened extends React.PureComponent {

  componentWillMount() {
    this.props.updateHoldings(this.props.wallet.id)
  }

  componentWillReceiveProps (nextProps) {
    const { id: currentId } = this.props.wallet
    const { id: nextId } = nextProps.wallet
    if (nextId && nextId !== currentId) {
      this.props.updateHoldings(nextId)
    }
  }

  render() {
    const { isEmpty, walletHoldingsLoaded, walletHoldingsError, path, component: Component } = this.props
    return (
      <Route path={path} render={props => (
        !isEmpty
          ? (!walletHoldingsLoaded
            ? (<LoadingFullscreen error={walletHoldingsError}/>)
            : (<Component {...props} />))
          : (<Redirect to='/connect' />)
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
