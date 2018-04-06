import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import BigNumber from 'bignumber.js'
import uuid from 'uuid/v4'

import { toUnit, toPercentage } from 'Utilities/convert'
import { updateObjectInArray, splice } from 'Utilities/helpers'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { toBigNumber } from 'Utilities/convert'

import { getCurrentPortfolioWithWalletHoldings, getAllAssets } from 'Selectors'
import { toggleOrderModal, showOrderModal } from 'Actions/redux'
import { setSwaps } from 'Actions/swap'
import { initiateSwaps } from 'Actions/portfolio'

import ModifyView from './view'

const ZERO = new BigNumber(0)

const filterAdjustedHoldings = (holdingsByWalletId) => {
  return Object.entries(holdingsByWalletId).reduce((filteredResult, [walletId, holdings]) => {
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
  .reduce((total, { balancesLoaded }) => balancesLoaded ? total + 1 : total, 0)

const initialState = {
  allowance: {
    fiat: ZERO,
    weight: ZERO
  },
  isAssetListOpen: false,
  assetListWalletId: '',
  walletBalancesLoaded: {}, // By walletId
  holdings: {}, // By walletId
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
    const walletHoldings = { ...state.holdings }
    const walletBalancesLoaded = { ...state.walletBalancesLoaded }
    portfolio.nestedWallets.forEach(({ id, balancesLoaded, assetHoldings }) => {
      const alreadyLoaded = walletBalancesLoaded[id]
      if (!alreadyLoaded) {
        // Only update holdings if balances weren't already loaded to avoid overwriting existing adjustments
        walletHoldings[id] = assetHoldings
          .filter(({ shown }) => shown)
          .map((asset) => this._assetItem(id, asset))
        walletBalancesLoaded[id] = balancesLoaded
      }
    })
    return { ...state, holdings: walletHoldings, walletBalancesLoaded }
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
    const { holdings } = this.state
    const walletHoldings = holdings[walletId]
    const assetIx = walletHoldings.findIndex(a => a.symbol === symbol)
    const asset = walletHoldings[assetIx]
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
      holdings: {
        ...holdings,
        [walletId]: updateObjectInArray(walletHoldings, {
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
    log.info('modify save')
    const { allowance, holdings } = this.state
    
    if (allowance.fiat.greaterThan(0)) return toastr.error('Amounts remain to move')

    const filteredHoldingsByWalletId = filterAdjustedHoldings(holdings)
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
          const sendUnits = toUnit(spent, sVal.price, sVal.decimals, true)
          toReceive = rAcc.toReceive.concat({
            walletId: rVal.walletId,
            symbol: rVal.symbol,
            sendUnits
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
        const sendUnitsTotal = toReceive.reduce((sum, { sendUnits }) => sum.plus(sendUnits), ZERO)
        const assetHolding = holdings[fromWalletId].find(({ symbol }) => symbol === fromSymbol)
        const difference = assetHolding.balance.minus(sendUnitsTotal)
        const last = toReceive[toReceive.length - 1]
        const newSendUnits = last.sendUnits.plus(difference)
        const newLast = { ...last, sendUnits: newSendUnits }
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
        sendUnits: receive.sendUnits,
        receiveWalletId: receive.walletId,
        receiveSymbol: receive.symbol
      }))
    ], [])

    this.props.setSwaps(normalizedList)
    this.props.showOrderModal()
    this.props.initiateSwaps(normalizedList)
    // this.props.routerPush('/swap')
    // this.props.changeSwapStatus('edit')
  }

  _hideAssetList () {
    this.setState({ isAssetListOpen: false })
  }

  _showAssetList (walletId) {
    this.setState({ isAssetListOpen: true, assetListWalletId: walletId })
  }

  _toggleAssetList () {
    this.setState({ isAssetListOpen: !this.state.isAssetListOpen })
  }

  _handleSelectAsset ({ symbol }) {
    const { allAssets } = this.props
    let { holdings, assetListWalletId: walletId } = this.state
    let walletHoldings = holdings[walletId]
    let selectedHolding
    let existingHoldingIndex = walletHoldings.findIndex((a) => a.symbol === symbol)
    if (existingHoldingIndex >= 0) {
      selectedHolding = {
        ...walletHoldings[existingHoldingIndex],
        shown: true
      }
      walletHoldings = splice(walletHoldings, existingHoldingIndex, 1)
    } else {
      selectedHolding = this._assetItem(walletId, allAssets[symbol])
    }
    this.setState({
      holdings: {
        ...holdings,
        [walletId]: walletHoldings.concat([selectedHolding])
      }
    })
    this._hideAssetList()
  }

  _handleRemoveAsset (walletId, symbol) {
    const updatedState = this._handleFiatChange(walletId, symbol, 0)
    const { holdings } = updatedState
    const walletHoldings = holdings[walletId]
    const selectedAssetIx = walletHoldings.findIndex((a) => a.symbol === symbol)
    this.setState({
      holdings: {
        ...holdings,
        [walletId]: splice(walletHoldings, selectedAssetIx, 1, { ...walletHoldings[selectedAssetIx], shown: false })
      }
    })
  }

  render () {
    const { portfolio, toggleOrderModal } = this.props
    const { holdings, assetListWalletId, allowance, isAssetListOpen } = this.state
    const adjustedPortfolio = {
      ...portfolio,
      nestedWallets: portfolio.nestedWallets.map((nestedWallet) => ({
        ...nestedWallet,
        assetHoldings: holdings[nestedWallet.id] || []
      }))
    }
    const sliderProps = {
      max: portfolio.totalFiat.toNumber(),
      // allowance: this.state.allowance.fiat,
      onValueChange: this._handleSlider
    }
    const assetListProps = {
      supportedAssetSymbols: ((portfolio.nestedWallets.find(({ id }) => id === assetListWalletId) || {}).supportedAssets || []),
      hiddenAssetSymbols: (holdings[assetListWalletId] || []).filter(({ shown }) => shown).map(({ symbol }) => symbol),
      selectAsset: this._handleSelectAsset,
      ignoreUnavailable: false
    }
    let disableSave
    const adjustedHoldings = filterAdjustedHoldings(holdings)
    if (Object.keys(adjustedHoldings).length === 0 || allowance.fiat.greaterThan(0)) {
      disableSave = true
    }
    return (
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
        handleToggleSignTxModal={toggleOrderModal}
        handleSave={this._handleSave}
        disableSave={disableSave}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  portfolio: getCurrentPortfolioWithWalletHoldings,
  allAssets: getAllAssets
})

const mapDispatchToProps = {
  setSwaps,
  routerPush: push,
  initiateSwaps,
  toggleOrderModal,
  showOrderModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(Modify)
