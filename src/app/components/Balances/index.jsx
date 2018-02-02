import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PieChart from 'Components/PieChart'
import PriceChart from 'Components/PriceChart'
import BalancesView from './view'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus } from 'Utilities/swap'
import { getBalances, removeSwundle } from 'Actions/request'
import { toggleOrderModal, resetSwap } from 'Actions/redux'
import { resetPortfolio, clearAllIntervals } from 'Actions/portfolio'
import { getCurrentPortfolio, getCurrentWallet, getAllAssetsArray } from 'Selectors'

let balancesInterval

class Balances extends Component {
  constructor (props) {
    super(props)
    this.state = {
      chartSelect: {},
      openCharts: {},
    }
    this._getBalances = this._getBalances.bind(this)
    this._toggleChart = this._toggleChart.bind(this)
    this._setChartSelect = this._setChartSelect.bind(this)
    this._orderStatus = this._orderStatus.bind(this)
    this._forgetOrder = this._forgetOrder.bind(this)
  }

  componentWillMount () {
    const refreshBalances = () => this._getBalances()
    balancesInterval = window.setInterval(refreshBalances, 30000)
    refreshBalances()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.viewOnlyAddress) {
      if (nextProps.viewOnlyAddress !== this.props.viewOnlyAddress) {
        window.clearInterval(balancesInterval)
        this.props.resetPortfolio()
        balancesInterval = window.setInterval(() => this._getBalances(), 30000)
        this._getBalances(true)
      }
    }
  }

  componentWillUnmount () {
    window.clearInterval(balancesInterval)
    if (!this.props.viewOnlyAddress) {
      const orderStatus = this._orderStatus()
      if (orderStatus === 'error' || orderStatus === 'complete') {
        this.props.resetSwap()
        this.props.removeSwundle(this.props.wallet.id)
      }
    }
  }

  _getBalances (resetPortfolio) {
    const { wallet, assets, getBalances } = this.props
    const portfolio = resetPortfolio ? {} : this.props.portfolio
    getBalances(assets, portfolio, wallet.id)
      .then(() => {
        this._setChartSelect('ETH')
      })
      .catch(log.error)
  }

  _toggleChart (symbol) {
    const { openCharts } = this.state
    this.setState({
      openCharts: {
        ...openCharts,
        [symbol]: !openCharts[symbol]
      }
    })
  }

  _setChartSelect (symbol) {
    const list = this.props.portfolio.list
    const asset = list.find(a => a.symbol === symbol)
    if (!asset.change24) {
      console.log(asset.symbol)
    }
    this.setState({ chartSelect: {
      name: asset.name || 'LOADING',
      symbol: asset.symbol || 'XXX',
      infoUrl: asset.infoUrl || 'https://faa.st',
      change: asset.change24 || -1,
      priceDecrease: asset.change24 && asset.change24.isNegative(),
      price: asset.price || -1
    } })
  }

  _orderStatus () {
    if (!this.props.swap.length) return false

    const statuses = this.props.swap.reduce((a, b) => {
      return a.concat(b.list.map(getSwapStatus).map(c => c.status))
    }, [])
    if (statuses.some(s => s === 'working')) return 'working'
    if (statuses.some(s => s === 'error')) return 'error'
    return 'complete'
  }

  _forgetOrder () {
    toastr.confirm(null, {
      component: () => (
        <div style={{ padding: 10, color: 'black' }}>
          Please be aware that <strong>forget</strong> does not actually cancel an order, it justs stops the browser app from tracking the status of the order. The order may still process normally. Please only proceed if you have been instructed to do so, or you understand the effects.
        </div>
      ),
      onOk: () => {
        clearAllIntervals()
        this.props.resetSwap()
        this.props.removeSwundle(this.props.wallet.address)
      }
    })
  }

  render () {
    const orderStatus = this._orderStatus()

    const { wallet, portfolio, viewOnlyAddress } = this.props
    const layoutProps = {
      showAction: true,
      showAddressSearch: true,
      view: this.props.viewOnlyAddress ? 'view' : 'balances',
      disableAction: !portfolio || !portfolio.list || !portfolio.list.length || orderStatus === 'working',
      handleModify: () => this.props.routerPush('/modify'),
    }
    const addressProps = {
      address: wallet.address,
      showDownloadKeystore: !viewOnlyAddress && wallet.isBlockstack
    }
    const totalDecrease = portfolio.totalChange && portfolio.totalChange.isNegative()
    return (
      <BalancesView
        pieChart={<PieChart portfolio={portfolio} chartSelect={this.state.chartSelect} handleChartSelect={this._setChartSelect} />}
        priceChart={<PriceChart chartSelect={this.state.chartSelect} />}
        layoutProps={layoutProps}
        mq={this.props.mq}
        total={portfolio.total}
        total24hAgo={portfolio.total24hAgo}
        totalChange={portfolio.totalChange}
        totalDecrease={totalDecrease}
        assetRows={portfolio.list.filter((holding) => holding.shown)}
        toggleChart={this._toggleChart}
        showOrderModal={this.props.orderModal.show}
        handleToggleOrderModal={this.props.toggleOrderModal}
        handleForgetOrder={this._forgetOrder}
        orderStatus={orderStatus}
        addressProps={addressProps}
        viewOnly={!!viewOnlyAddress}
        openCharts={this.state.openCharts}
      />
    )
  }
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired,
  assets: PropTypes.array.isRequired,
  portfolio: PropTypes.object.isRequired,
  mock: PropTypes.object.isRequired,
  getBalances: PropTypes.func.isRequired,
  routerPush: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: getCurrentWallet(state),
  assets: getAllAssetsArray(state),
  portfolio: getCurrentPortfolio(state),
  mock: state.mock,
  orderModal: state.orderModal,
  swap: state.swap,
  mq: state.mediaQueries
})

const mapDispatchToProps = (dispatch) => ({
  getBalances: (assets, portfolio, wallet, mock, swap) => {
    return dispatch(getBalances(assets, portfolio, wallet, mock, swap))
  },
  routerPush: (path) => {
    dispatch(push(path))
  },
  toggleOrderModal: () => {
    dispatch(toggleOrderModal())
  },
  resetSwap: () => {
    dispatch(resetSwap())
  },
  resetPortfolio: () => {
    dispatch(resetPortfolio())
  },
  removeSwundle: (address) => {
    dispatch(removeSwundle(address))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Balances)
