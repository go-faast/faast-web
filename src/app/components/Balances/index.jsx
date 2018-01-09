import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PieChart from 'Components/PieChart'
import PriceChart from 'Components/PriceChart'
import BalancesView from './view'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { updateObjectInArray } from 'Utilities/helpers'
import { getSwapStatus } from 'Utilities/swap'
import { getBalances, removeSwundle } from 'Actions/request'
import { clearAllIntervals } from 'Actions/portfolio'
import { toggleOrderModal, resetSwap, resetPortfolio } from 'Actions/redux'

let balancesInterval

class Balances extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      chartSelect: {},
      address: props.viewOnlyAddress || props.wallet.address
    }
    this._getBalances = this._getBalances.bind(this)
    this._toggleChart = this._toggleChart.bind(this)
    this._setChartSelect = this._setChartSelect.bind(this)
    this._setList = this._setList.bind(this)
    this._orderStatus = this._orderStatus.bind(this)
    this._forgetOrder = this._forgetOrder.bind(this)
  }

  componentWillMount () {
    const refreshBalances = () => {
      this._getBalances(this.state.address)
    }
    balancesInterval = window.setInterval(refreshBalances, 30000)
    this._setList()
    refreshBalances()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.viewOnlyAddress && nextProps.viewOnlyAddress !== this.state.address) {
      this.setState({ list: [], address: nextProps.viewOnlyAddress })
      window.clearInterval(balancesInterval)
      this.props.resetPortfolio()
      balancesInterval = window.setInterval(() => this._getBalances(nextProps.viewOnlyAddress), 30000)
      this._getBalances(nextProps.viewOnlyAddress, true)
    }
  }

  componentWillUnmount () {
    window.clearInterval(balancesInterval)
    if (!this.props.viewOnlyAddress) {
      const orderStatus = this._orderStatus()
      if (orderStatus === 'error' || orderStatus === 'complete') {
        this.props.resetSwap()
        this.props.removeSwundle(this.props.wallet.address)
      }
    }
  }

  _setList () {
    if (this.props.portfolio.list && this.props.portfolio.list.length) {
      const list = this.props.portfolio.list.map((a) => {
        if (a.shown) {
          return {
            name: a.name,
            symbol: a.symbol,
            units: a.balance,
            weight: a.percentage,
            price: a.price,
            value: a.fiat,
            change: a.change24,
            infoUrl: a.infoUrl,
            priceDecrease: a.change24.isNegative(),
            chartOpen: false
          }
        }
      }).filter(a => a)
      this.setState({ list })
    }
  }

  _getBalances (address, resetPortfolio) {
    const portfolio = resetPortfolio ? {} : this.props.portfolio
    this.props.getBalances(this.props.assets, portfolio, address, this.props.mock, this.props.swap)
    .then(() => {
      this._setChartSelect('ETH')
      this._setList()
    })
    .catch(log.error)
  }

  _toggleChart (symbol) {
    const assetIx = this.state.list.findIndex(a => a.symbol === symbol)
    if (assetIx >= 0) {
      this.setState({
        list: updateObjectInArray(this.state.list, {
          index: assetIx,
          item: Object.assign({}, this.state.list[assetIx], { chartOpen: !this.state.list[assetIx].chartOpen })
        })
      })
    }
  }

  _setChartSelect (symbol) {
    const list = this.props.portfolio.list
    const asset = list.find(a => a.symbol === symbol)
    this.setState({ chartSelect: {
      name: asset.name,
      symbol: asset.symbol,
      infoUrl: asset.infoUrl,
      change: asset.change24,
      priceDecrease: asset.change24.isNegative(),
      price: asset.price
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

    const portfolio = this.props.portfolio

    const layoutProps = {
      showAction: true,
      showAddressSearch: true,
      view: this.props.viewOnlyAddress ? 'view' : 'balances',
      disableAction: !portfolio || !portfolio.list || !portfolio.list.length || orderStatus === 'working',
      handleModify: () => this.props.routerPush('/modify')
    }
    const addressProps = {
      address: this.state.address,
      showDownloadKeystore: !this.props.viewOnlyAddress && this.props.wallet.type === 'blockstack'
    }
    const totalDecrease = portfolio.totalChange && portfolio.totalChange.isNegative()
    return (
      <BalancesView
        pieChart={<PieChart chartSelect={this.state.chartSelect} handleChartSelect={this._setChartSelect} />}
        priceChart={<PriceChart chartSelect={this.state.chartSelect} />}
        layoutProps={layoutProps}
        total={portfolio.total}
        total24hAgo={portfolio.total24hAgo}
        totalChange={portfolio.totalChange}
        totalDecrease={totalDecrease}
        assetRows={this.state.list}
        toggleChart={this._toggleChart}
        showOrderModal={this.props.orderModal.show}
        handleToggleOrderModal={this.props.toggleOrderModal}
        handleForgetOrder={this._forgetOrder}
        orderStatus={orderStatus}
        addressProps={addressProps}
        viewOnly={!!this.props.viewOnlyAddress}
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
  wallet: state.wallet,
  assets: state.assets,
  portfolio: state.portfolio,
  mock: state.mock,
  orderModal: state.orderModal,
  swap: state.swap
})

const mapDispatchToProps = (dispatch) => ({
  getBalances: (assets, portfolio, walletAddress, mock, swap) => {
    return dispatch(getBalances(assets, portfolio, walletAddress, mock, swap))
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
