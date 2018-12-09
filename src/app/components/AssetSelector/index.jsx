import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import AssetSelectorView from './view'
import { sortByProperty } from 'Utilities/helpers'
import { getAllAssetsArray } from 'Selectors/asset'

function applySortOrder (list) {
  return sortByProperty(list, 'disabled')
}

function getInitState (props) {
  const { assets, supportedAssetSymbols, portfolioSymbols, isAssetDisabled } = props
  let assetList = [...assets]
    .map((a) => {
      const unsupportedWallet = !supportedAssetSymbols.includes(a.symbol)
      const alreadyInPortfolio = portfolioSymbols.includes(a.symbol)
      const swapDisabled = isAssetDisabled(a)
      const disabled = swapDisabled || unsupportedWallet || alreadyInPortfolio
      const disabledMessage = swapDisabled
        ? 'coming soon'
        : (unsupportedWallet
          ? 'unsupported wallet'
          : (alreadyInPortfolio
            ? 'already added'
            : 'unavailable'))
      return {
        ...a,
        disabled,
        disabledMessage,
        swapDisabled,
        unsupportedWallet,
        alreadyInPortfolio,
      }
    })
    .sort((a, b) => b.marketCap.cmp(a.marketCap))
  assetList = applySortOrder(assetList)
  const fuse = new Fuse(assetList, {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    keys: ['symbol', 'name']
  })
  return {
    searchQuery: '',
    fuse,
    assetList,
    assetListOriginal: assetList
  }
}

class AssetSelector extends Component {
  constructor (props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    this.state = getInitState(props)
  }

  handleSearchChange (event) {
    const query = event.target.value
    let results
    if (!query) {
      results = this.state.assetListOriginal
    } else {
      results = this.state.fuse.search(query)
      results = applySortOrder(results)
    }
    this.setState({
      searchQuery: query,
      assetList: results
    })
  }

  handleSearchSubmit () {
    const { assetList, searchQuery } = this.state
    if (searchQuery && assetList.length > 0) {
      this.handleSelect(assetList[0])
    }
  }

  handleSelect (asset) {
    const { selectAsset } = this.props
    if (asset.disabled) {
      return toastr.warning('INVALID', `Cannot add ${asset.name}: ${asset.disabledMessage}`)
    }
    selectAsset(asset)
  }

  render () {
    const { assetList } = this.state
    const { handleSelect, handleSearchSubmit, handleSearchChange } = this
    return (
      <AssetSelectorView
        assetList={assetList}
        handleSelect={handleSelect}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchChange={handleSearchChange}
      />
    )
  }
}

AssetSelector.propTypes = {
  assets: PropTypes.array.isRequired,
  selectAsset: PropTypes.func.isRequired,
  supportedAssetSymbols: PropTypes.arrayOf(PropTypes.string),
  portfolioSymbols: PropTypes.arrayOf(PropTypes.string),
  isAssetDisabled: PropTypes.func
}

AssetSelector.defaultProps = {
  supportedAssetSymbols: [],
  portfolioSymbols: [],
  isAssetDisabled: (asset) => !asset.swapEnabled
}

export default connect(createStructuredSelector({
  assets: getAllAssetsArray,
}))(AssetSelector)
