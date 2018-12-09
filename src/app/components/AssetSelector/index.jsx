import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import { debounce } from 'debounce'
import AssetSelectorView from './view'
import { sortByProperty } from 'Utilities/helpers'
import { getAllAssetsArray, isAppRestricted } from 'Selectors/asset'

const DEBOUNCE_WAIT = 400
const MAX_RESULTS = 50

function applySortOrder (list) {
  return sortByProperty(list, 'disabled')
}

function getInitState (props) {
  const { assets, supportedAssetSymbols, portfolioSymbols, isAssetDisabled, isAppRestricted } = props
  let assetList = [...assets]
    .map((a) => {
      const unsupportedWallet = !supportedAssetSymbols.includes(a.symbol)
      const alreadyInPortfolio = portfolioSymbols.includes(a.symbol)
      const swapDisabled = isAssetDisabled(a)
      const restricted = a.restricted && isAppRestricted
      const disabled = swapDisabled || unsupportedWallet || alreadyInPortfolio || restricted
      const disabledMessage = swapDisabled
        ? 'coming soon'
        : (restricted ? 
          'unavailable in your location' : 
          (unsupportedWallet
            ? 'unsupported wallet'
            : (alreadyInPortfolio
              ? 'already added'
              : 'unavailable')))
      return {
        ...a,
        restricted,
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
  const assetListDefault = assetList.filter((a) => !isAssetDisabled(a))
  return {
    searchQuery: '',
    fuse,
    results: assetListDefault,
    assetListDefault,
  }
}

class AssetSelector extends Component {
  constructor (props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    this.performSearch = debounce(this.performSearch.bind(this), DEBOUNCE_WAIT)
    this.state = getInitState(props)
  }

  performSearch (query) {
    let results
    if (!query) {
      results = this.state.assetListDefault
    } else {
      results = this.state.fuse.search(query)
      results = applySortOrder(results)
      results = results.slice(0, MAX_RESULTS)
    }
    this.setState({
      results,
    })
  }

  handleSearchChange (event) {
    const query = event.target.value
    this.setState({
      searchQuery: query,
    })
    this.performSearch(query)
  }

  handleSearchSubmit () {
    const { results, searchQuery } = this.state
    if (searchQuery && results.length > 0) {
      this.handleSelect(results[0])
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
    const { results } = this.state
    const { handleSelect, handleSearchSubmit, handleSearchChange } = this
    return (
      <AssetSelectorView
        results={results}
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
  isAssetDisabled: PropTypes.func,
}

AssetSelector.defaultProps = {
  supportedAssetSymbols: [],
  portfolioSymbols: [],
  isAssetDisabled: (asset) => !asset.swapEnabled
}

export default connect(createStructuredSelector({
  assets: getAllAssetsArray,
  isAppRestricted: isAppRestricted,
}))(AssetSelector)
