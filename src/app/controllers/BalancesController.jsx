import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PieChartController from 'Controllers/PieChartController'
import PriceChartController from 'Controllers/PriceChartController'
import Balances from 'Views/Balances'
import log from 'Utilities/log'
import { updateObjectInArray } from 'Utilities/helpers'
import { getSwapStatus } from 'Utilities/swap'
import { clearSwap } from 'Utilities/storage'
import { getBalances } from 'Actions/request'
import { toggleOrderModal, resetSwap, resetPortfolio } from 'Actions/redux'

let balancesInterval

class BalancesController extends Component {
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
        clearSwap(this.props.wallet.address)
      }
    }
  }

  _setList () {
    if (this.props.portfolio.list && this.props.portfolio.list.length) {
      const list = this.props.portfolio.list.map((a, i) => {
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
    this.props.getBalances(this.props.assets, portfolio, address, this.props.mock)
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
  render () {
    const orderStatus = this._orderStatus()

    const portfolio = this.props.portfolio
    const layoutProps = {
      showAction: true,
      showAddressSearch: true,
      view: this.props.viewOnlyAddress ? 'view' : 'balances',
      disableAction: !portfolio || !portfolio.list || !portfolio.list.length || orderStatus === 'working',
      handleModify: () => this.props.routerPush('/modify'),
    }
    const addressProps = {
      address: this.state.address,
      showDownloadKeystore: !this.props.viewOnlyAddress && this.props.wallet.type === 'blockstack'
    }
    const totalDecrease = portfolio.totalChange && portfolio.totalChange.isNegative()
    return (
      <Balances
        pieChart={<PieChartController chartSelect={this.state.chartSelect} handleChartSelect={this._setChartSelect} />}
        priceChart={<PriceChartController chartSelect={this.state.chartSelect} />}
        layoutProps={layoutProps}
        mq={this.props.mq}
        total={portfolio.total}
        total24hAgo={portfolio.total24hAgo}
        totalChange={portfolio.totalChange}
        totalDecrease={totalDecrease}
        assetRows={this.state.list}
        toggleChart={this._toggleChart}
        showOrderModal={this.props.orderModal.show}
        handleToggleOrderModal={this.props.toggleOrderModal}
        orderStatus={orderStatus}
        addressProps={addressProps}
        viewOnly={!!this.props.viewOnlyAddress}
      />
    )
  }
}

BalancesController.propTypes = {
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
  swap: state.swap,
  mq: state.mediaQueries
})

const mapDispatchToProps = (dispatch) => ({
  getBalances: (assets, portfolio, walletAddress, mock) => {
    return dispatch(getBalances(assets, portfolio, walletAddress, mock))
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
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BalancesController)
