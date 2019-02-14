import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import uuid from 'uuid/v4'

import { toUnit, toPercentage } from 'Utilities/convert'
import { updateObjectInArray, splice } from 'Utilities/helpers'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { ZERO, toBigNumber } from 'Utilities/convert'

import { getCurrentPortfolioWithWalletHoldings, getAllAssets, isAppRestricted, isAppBlocked } from 'Selectors'
import { toggleOrderModal, showOrderModal } from 'Actions/orderModal'
import { createSwundle } from 'Actions/swundle'

import Blocked from 'Components/Blocked'
import ModifyView from './view'

const filterAdjustedHoldings = (walletHoldings) => {
  return Object.entries(walletHoldings).reduce((filteredResult, [walletId, holdings]) => {
    const filteredHoldings = holdings.map((a) => {
      if (!a.fiat.adjusted.equals(a.fiat.original)) {
        const fiatToSwap = a.fiat.original.minus(a.fiat.adjusted)
        return { ...a, fiatToSwap }
      }
    }).filter(a => !!a)
    if (filteredHoldings.length > 0) {
      filteredResult[walletId] = filteredHoldings
    }
    return filteredResult
  }, {})
}

const flatten = (arrays) => arrays.reduce((flat, array) => flat.concat(array), [])

const countLoadedWallets = (portfolio) => portfolio.nestedWallets
  .reduce((total, { holdingsLoaded }) => holdingsLoaded ? total + 1 : total, 0)

const initialState = {
  allowance: {
    fiat: ZERO,
    weight: ZERO
  },
  isAssetListOpen: false,
  assetListWalletId: '',
  walletHoldingsLoaded: {}, // By walletId
  walletHoldings: {}, // By walletId
  addButtonLocation: 'top'
}

class Modify extends Component {
  constructor (props) {
    super(props)
    this._assetItem = this._assetItem.bind(this)
    this._handleSlider = this._handleSlider.bind(this)
    this._handleFiatChange = this._handleFiatChange.bind(this)
    this._handleWeightChange = this._handleWeightChange.bind(this)
    this._showAssetList = this._showAssetList.bind(this)
    this._hideAssetList = this._hideAssetList.bind(this)
    this._toggleAssetList = this._toggleAssetList.bind(this)
    this._handleSelectAsset = this._handleSelectAsset.bind(this)
    this._handleRemoveAsset = this._handleRemoveAsset.bind(this)
    this._handleSave = this._handleSave.bind(this)
    this.state = this.getInitialState(props, initialState)
  }

  getInitialState = (props, state) => {
    const { portfolio } = props
    const walletHoldings = { ...state.walletHoldings }
    const walletHoldingsLoaded = { ...state.walletHoldingsLoaded }
    portfolio.nestedWallets.forEach(({ id, holdingsLoaded, assetHoldings }) => {
      const alreadyLoaded = walletHoldingsLoaded[id]
      if (!alreadyLoaded) {
        // Only update holdings if balances weren't already loaded to avoid overwriting existing adjustments
        walletHoldings[id] = assetHoldings
          .filter(({ shown }) => shown)
          .map((asset) => this._assetItem(id, asset))
        walletHoldingsLoaded[id] = holdingsLoaded
      }
    })
    return { ...state, walletHoldings, walletHoldingsLoaded }
  }

  componentWillReceiveProps (nextProps) {
    const { portfolio: currentPortfolio } = this.props
    const { portfolio: nextPortfolio } = nextProps
    if (currentPortfolio.id !== nextPortfolio.id
      || countLoadedWallets(currentPortfolio) !== countLoadedWallets(nextPortfolio)) {
      this.setState(this.getInitialState(nextProps, this.state))
    }
  }

  _assetItem (walletId, asset) {
    const weight = asset.percentage || ZERO
    const fiat = asset.fiat || ZERO
    const units = asset.balance || ZERO
    return {
      ...asset,
      walletId,
      priceDecrease: asset.change24.isNegative(),
      shown: true,
      weight: {
        original: weight,
        adjusted: weight
      },
      fiat: {
        original: fiat,
        adjusted: fiat,
      },
      units: {
        original: units,
        adjusted: units
      },
      refInput: this[`refInput_${walletId}_${asset.symbol}`]
    }
  }

  _handleSlider (walletId, symbol, value, type = 'fiat') {
    const { portfolio } = this.props
    const { walletHoldings } = this.state
    const holdings = walletHoldings[walletId]
    const assetIx = holdings.findIndex(a => a.symbol === symbol)
    const asset = holdings[assetIx]
    value = toBigNumber(value)

    if (value.lt(0)) {
      value = ZERO
    }
    const maxAllowed = asset[type].adjusted.plus(this.state.allowance[type])
    if (maxAllowed.lessThanOrEqualTo(value)) {
      value = maxAllowed
    }

    const available = asset[type].adjusted.minus(value)
    let fiat
    let weight
    let units
    let allowanceFiat
    let allowanceWeight
    switch (type) {
      case 'fiat':
        fiat = ZERO.plus(value)
        if (asset.fiat.original.round(2).equals(value)) {
          fiat = asset.fiat.original
          weight = asset.weight.original
          units = asset.units.original
        } else {
          weight = toPercentage(fiat, portfolio.totalFiat)
          units = toUnit(fiat, asset.price, asset.decimals, true)
        }
        allowanceFiat = this.state.allowance.fiat.plus(available).round(2)
        allowanceWeight = toPercentage(allowanceFiat, portfolio.totalFiat)
        break
      case 'weight':
        /* out of commission due to rounding issues. Determining fiat amount instead now */

        // weight = ZERO.plus(value)
        // fiat = weight.div(100).times(portfolio.totalFiat)
        // units = asset.units.adjusted
        // allowanceWeight = this.state.allowance.weight.plus(available)
        // allowanceFiat = allowanceWeight.div(100).times(portfolio.totalFiat)
        // allowanceFiat = this.state.allowance.fiat.plus(available)
        // allowanceWeight = percentage(allowanceFiat, portfolio.totalFiat)
    }
    const updatedState = {
      walletHoldings: {
        ...walletHoldings,
        [walletId]: updateObjectInArray(holdings, {
          index: assetIx,
          item: {
            ...asset,
            weight: { ...asset.weight, adjusted: weight },
            fiat: { ...asset.fiat, adjusted: fiat },
            units: { ...asset.units, adjusted: units }
          }
        }),
      },
      allowance: {
        fiat: allowanceFiat,
        weight: allowanceWeight
      }
    }
    this.setState(updatedState)
    return updatedState
  }

  _handleFiatChange (walletId, symbol, value) {
    return this._handleSlider(walletId, symbol, value)
  }

  _handleWeightChange (walletId, symbol, value) {
    const weight = toBigNumber(value)
    const fiat = weight.div(100).times(this.props.portfolio.totalFiat).round(2)
    return this._handleSlider(walletId, symbol, fiat)
  }

  _handleSave () {
    log.debug('modify save')
    const { allowance, walletHoldings } = this.state
    
    if (allowance.fiat.greaterThan(0)) return toastr.error('Amounts remain to move')

    const filteredHoldingsByWalletId = filterAdjustedHoldings(walletHoldings)
    const adjustedWalletIds = Object.keys(filteredHoldingsByWalletId)
    if (adjustedWalletIds.length === 0) return toastr.error('Nothing to swap')

    const filtered = flatten(Object.values(filteredHoldingsByWalletId))
    const swapSend = filtered.filter(s => !s.fiatToSwap.isNegative()).map((s) => {
      return Object.assign({}, s, { emptyAsset: s.fiat.adjusted.isZero() })
    })
    const swapReceive = filtered.filter((s) => s.fiatToSwap.isNegative())
    const sendReduce = swapSend.reduce((sAcc, sVal) => {
      const receiveReduce = sAcc.receiveList.reduce((rAcc, rVal) => {
        let remaining
        let toReceive
        let spent = ZERO
        if (rAcc.toSwap.greaterThan(0) && rVal.fiatToSwap.lessThan(0)) {
          remaining = rAcc.toSwap.plus(rVal.fiatToSwap)
          spent = remaining.lessThan(0) ? rAcc.toSwap : rAcc.toSwap.minus(remaining)
          let sendAmount = toUnit(spent, sVal.price, sVal.decimals, true)
          // Round to a reasonable number of decimal places to improve readability on hardware wallet
          // screens. 8 decimals is more than enough to accurately represent $0.01 of any asset
          sendAmount = sendAmount.round(8)
          toReceive = rAcc.toReceive.concat({
            walletId: rVal.walletId,
            symbol: rVal.symbol,
            sendAmount
          })
        } else {
          remaining = rAcc.toSwap
          toReceive = rAcc.toReceive
        }
        return Object.assign({}, rAcc, {
          toSwap: remaining,
          toReceive,
          list: rAcc.list.concat(Object.assign({}, rVal, {
            fiatToSwap: rVal.fiatToSwap.plus(spent)
          }))
        })
      }, { toSwap: sVal.fiatToSwap, toReceive: [], list: [] })
      return Object.assign({}, sAcc, {
        swapList: sAcc.swapList.concat({
          walletId: sVal.walletId,
          symbol: sVal.symbol,
          toReceive: receiveReduce.toReceive,
          emptyAsset: sVal.emptyAsset
        }),
        receiveList: receiveReduce.list
      })
    }, { receiveList: swapReceive, swapList: [] })

    const repairedList = sendReduce.swapList.map((s) => {
      // If sending entire asset balance, ensure no dust is left behind
      // by adding the difference to the last swap that sends it
      const { walletId: fromWalletId, symbol: fromSymbol, emptyAsset, toReceive } = s
      if (emptyAsset) {
        const sendAmountTotal = toReceive.reduce((sum, { sendAmount }) => sum.plus(sendAmount), ZERO)
        const assetHolding = walletHoldings[fromWalletId].find(({ symbol }) => symbol === fromSymbol)
        const difference = assetHolding.balance.minus(sendAmountTotal)
        const last = toReceive[toReceive.length - 1]
        const newsendAmount = last.sendAmount.plus(difference)
        const newLast = { ...last, sendAmount: newsendAmount }
        const repairedToReceive = toReceive.slice(0, -1).concat([newLast])
        return { ...s, toReceive: repairedToReceive }
      }
      return s
    })

    const emptyingETH = repairedList.find(a => a.symbol === 'ETH' && a.emptyAsset)
    if (emptyingETH) return toastr.error('Swapping the entire balance of your Ether is not possible as some ETH is required for transaction fees', { timeOut: 10000 })

    const normalizedList = repairedList.reduce((result, send) => [
      ...result, ...send.toReceive.map((receive) => ({
        id: uuid(),
        sendWalletId: send.walletId,
        sendSymbol: send.symbol,
        sendAmount: receive.sendAmount,
        receiveWalletId: receive.walletId,
        receiveSymbol: receive.symbol
      }))
    ], [])

    this.props.showOrderModal()
    this.props.createSwundle(normalizedList)
  }

  _hideAssetList () {
    this.setState({ isAssetListOpen: false })
  }

  _showAssetList (walletId, location) {
    this.setState({ isAssetListOpen: true, assetListWalletId: walletId, addButtonLocation: location })
  }

  _toggleAssetList () {
    this.setState({ isAssetListOpen: !this.state.isAssetListOpen })
  }

  _handleSelectAsset ({ symbol }) {
    const { allAssets } = this.props
    let { walletHoldings, addButtonLocation, assetListWalletId: walletId } = this.state
    let holdings = walletHoldings[walletId]
    let selectedHolding
    let existingHoldingIndex = holdings.findIndex((a) => a.symbol === symbol)
    if (existingHoldingIndex >= 0) {
      selectedHolding = {
        ...holdings[existingHoldingIndex],
        shown: true
      }
      walletHoldings = splice(holdings, existingHoldingIndex, 1)
    } else {
      selectedHolding = this._assetItem(walletId, allAssets[symbol])
    }
    this.setState({
      walletHoldings: {
        ...walletHoldings,
        [walletId]: addButtonLocation === 'bottom' ? holdings.concat([selectedHolding]) : [selectedHolding].concat(holdings)
      }
    })
    this._hideAssetList()
  }

  _handleRemoveAsset (walletId, symbol) {
    const updatedState = this._handleFiatChange(walletId, symbol, 0)
    const { walletHoldings } = updatedState
    const holdings = walletHoldings[walletId]
    const selectedAssetIx = holdings.findIndex((a) => a.symbol === symbol)
    this.setState({
      walletHoldings: {
        ...walletHoldings,
        [walletId]: splice(holdings, selectedAssetIx, 1, { ...holdings[selectedAssetIx], shown: false })
      }
    })
  }

  render () {
    const { portfolio, isAppRestricted, blocked } = this.props
    const { walletHoldings, assetListWalletId, allowance, isAssetListOpen } = this.state
    const adjustedPortfolio = {
      ...portfolio,
      nestedWallets: portfolio.nestedWallets.map((nestedWallet) => ({
        ...nestedWallet,
        assetHoldings: walletHoldings[nestedWallet.id] || []
      }))
    }
    const sliderProps = {
      max: portfolio.totalFiat.toNumber(),
      // allowance: this.state.allowance.fiat,
      onValueChange: this._handleSlider
    }
    const assetListProps = {
      supportedAssetSymbols: ((portfolio.nestedWallets.find(({ id }) => id === assetListWalletId) || {}).supportedAssets || []),
      portfolioSymbols: (walletHoldings[assetListWalletId] || []).filter(({ shown }) => shown).map(({ symbol }) => symbol),
      selectAsset: (asset) => this._handleSelectAsset(asset,),
      ignoreUnavailable: false,
    }
    let disableSave
    const adjustedHoldings = filterAdjustedHoldings(walletHoldings)
    if (Object.keys(adjustedHoldings).length === 0 || allowance.fiat.greaterThan(0)) {
      disableSave = true
    }
    return (
      <Fragment>
        {blocked ? (
          <Blocked/>
        ) : null}
        <ModifyView
          assetListProps={assetListProps}
          isAssetListOpen={isAssetListOpen}
          showAssetList={this._showAssetList}
          hideAssetList={this._hideAssetList}
          toggleAssetList={this._toggleAssetList}
          handleRemove={this._handleRemoveAsset}
          portfolio={adjustedPortfolio}
          sliderProps={sliderProps}
          allowance={allowance}
          handleFiatChange={this._handleFiatChange}
          handleWeightChange={this._handleWeightChange}
          handleSave={this._handleSave}
          disableSave={disableSave}
          isAppRestricted={isAppRestricted}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  portfolio: getCurrentPortfolioWithWalletHoldings,
  allAssets: getAllAssets,
  isAppRestricted: isAppRestricted,
  blocked: isAppBlocked,
})

const mapDispatchToProps = {
  routerPush: push,
  createSwundle,
  toggleOrderModal,
  showOrderModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(Modify)
