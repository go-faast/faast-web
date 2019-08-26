import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withState, withPropsOnChange } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import debounceHandler from 'Hoc/debounceHandler'
import { Row, Col, Button, Input } from 'reactstrap'
import PropTypes from 'prop-types'
import { sortByProperty } from 'Utilities/helpers'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import classNames from 'class-names'
import style from './style.scss'

import { getAllAssetsArray } from 'Selectors/asset'
import { isAppRestricted } from 'Selectors/app'
import { getWalletWithHoldings } from 'Selectors/wallet'

import { doToggleFeedbackForm } from 'Common/actions/app'
import T from 'Components/i18n/T'

const DEBOUNCE_WAIT = 400
const MAX_RESULTS = 50

const renderResult = (asset, { walletHoldings, handleSelect, dark }) => {
  const { symbol, name, disabled, disabledMessage, restricted } = asset
  const balance = walletHoldings && walletHoldings.balances[symbol]
  const hasBalance = balance && balance.gt(0)
  return (
    <Row key={symbol} className={classNames('p-0 m-0 position-relative', !disabled && 'cursor-pointer', !dark && style.light)} style={{ maxWidth: '100%', cursor: disabled && restricted && 'default' }}>
      <Col className='p-0 m-0'>
        <Button tag={Row} color='ultra-dark' size='sm' onClick={() => handleSelect(asset)} disabled={disabled}
          className={classNames(style.assetButtonList, 'flat text-left m-0')} style={{ borderTopWidth: 0, height: 49 }}>
          <Col className='pl-2 d-flex align-items-center' xs='8'>
            <CoinIcon symbol={symbol} style={{ width: 26, height: 26 }} className={classNames('mb-0', style.assetButtonIcon)} />
            <span className='ml-2'>{name} <small className='text-muted'>[{symbol}]</small></span>
          </Col>
          <Col className={classNames('text-right p-0 align-items-center justify-content-end', !disabled && !hasBalance ? 'd-none' : 'd-flex')} xs='4'>
            {disabled ? (
              <small style={{ zIndex: 9999999 }} className='p-0 m-0'>
                {disabledMessage}
              </small>
            ) : hasBalance ? (
              <small style={{ zIndex: 9999999 }} className='p-0 m-0 text-primary'>
                <Units precision={5} value={balance} symbol={symbol} showSymbol/>
              </small>) : null}
          </Col>
        </Button>
      </Col>
      {disabled && (
        <div 
          className={classNames('position-absolute', style.disabledCover)}
        ></div>
      )}
    </Row>
  )}

const AssetSelector = ({ handleSearchChange, results, onClose, rowsToShow, dark, ...props }) => {
  return (
    <Row style={{ maxWidth: '100%' }} className={classNames('p-0 m-0', !dark && style.light)}>
      <Col className='p-0 m-0 position-relative' style={{ maxHeight: 41 }} sm='12'>
        {onClose && (
          <Button
            color='link-plain'
            tag='span'
            onClick={onClose}
            className='position-absolute text-muted cursor-pointer btn-link' 
            style={{ top: 9, right: 20, zIndex: 99999999 }}
          > ✕
          </Button>
        )}
        <Input
          name='searchAsset'
          className='flat'
          placeholder='Search by name or symbol...'
          type='text'
          autoFocus
          autoComplete='off'
          onChange={handleSearchChange}
        />
      </Col>
      <Col className='p-0 shadow' sm='12' style={{ maxHeight: (rowsToShow * 49), overflowY: 'scroll', zIndex: 99999, marginTop: 1 }}>
        {results.slice(0, 20).map(r => renderResult(r, { dark, ...props }))}
      </Col>
    </Row>
  )
}

export default compose(
  setDisplayName('AssetSelector'),
  setPropTypes({
    assets: PropTypes.array,
    selectAsset: PropTypes.func.isRequired,
    supportedAssetSymbols: PropTypes.arrayOf(PropTypes.string),
    portfolioSymbols: PropTypes.arrayOf(PropTypes.string),
    isAssetDisabled: PropTypes.func,
    onClose: PropTypes.func,
    walletId: PropTypes.string,
    rowsToShow: PropTypes.number,
    dark: PropTypes.bool
  }),
  defaultProps({
    supportedAssetSymbols: [],
    portfolioSymbols: [],
    isAssetDisabled: (asset) => !asset.swapEnabled,
    rowsToShow: 5,
    dark: true
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    isAppRestricted: isAppRestricted,
    walletHoldings: (state, { walletId }) => getWalletWithHoldings(state, walletId),
  }), {
    doToggleFeedbackForm
  }),
  withState('searchQuery', 'updateSearchQuery', ''),
  withHandlers({
    applySortOrder: () => (list) => {
      return sortByProperty(list, 'disabled')
    },
    assetExtender: ({ supportedAssetSymbols, portfolioSymbols, 
      isAssetDisabled, isAppRestricted, doToggleFeedbackForm }) => (assets) => {
      return assets.map((a) => {
        const unsupportedWallet = !supportedAssetSymbols.includes(a.symbol)
        const alreadyInPortfolio = portfolioSymbols.includes(a.symbol)
        const swapDisabled = isAssetDisabled(a)
        const restricted = a.restricted && isAppRestricted
        const disabled = swapDisabled || unsupportedWallet || alreadyInPortfolio || restricted
        const disabledMessage = swapDisabled
          ? <T tag='span' i18nKey='app.assetSelector.comingSoo'>
            <span 
              onClick={() => doToggleFeedbackForm(a.name)}
              target='_blank noopener noreferrer'
              className={classNames('btn-link cursor-pointer', style.assetListDisabledMessage)}
            >request asset</span>
          </T>
          : (restricted ? 
            <a 
              href='https://medium.com/faast/faast-location-restrictions-9b14e100d828' 
              target='_blank noopener noreferrer'
              className={classNames(style.assetListDisabledMessage)}
            >
              <T tag='span' i18nKey='app.assetSelector.geoRestricted'>geo restricted</T>
            </a> : 
            (unsupportedWallet
              ? <T tag='span' i18nKey='app.assetSelector.unsupported'>unsupported wallet</T>
              : (alreadyInPortfolio
                ? <T tag='span' i18nKey='app.assetSelector.alreadyAdded'>already added</T>
                : null)))
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
    }
  }),
  withState('extendedAssets', 'updateExtendedAssets', ({ assets, applySortOrder, assetExtender }) => {
    return applySortOrder(assetExtender(assets))
  }),
  withState('results', 'updateResults', ({ extendedAssets }) => extendedAssets),
  withPropsOnChange(['assets'], ({ extendedAssets }) => {
    const fuse = new Fuse(extendedAssets, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      keys: [{
        name: 'symbol',
        weight: 0.8,
      }, {
        name: 'name',
        weight: 0.2,
      }],
    })
    return ({
      fuse
    })
  }),
  withHandlers({
    performSearch: ({ updateResults, fuse, applySortOrder, extendedAssets }) => (query) => {
      let results
      if (!query) {
        results = extendedAssets
      } else {
        results = fuse.search(query)
        results = applySortOrder(results)
        results = results.slice(0, MAX_RESULTS)
      }
      updateResults(results)
    },
    handleSelect: ({ selectAsset }) => (asset) => {
      if (asset.disabled) {
        return toastr.warning('INVALID', `Cannot add ${asset.name}: ${asset.disabledMessage}`)
      }
      selectAsset(asset)
    }
  }),
  withHandlers({
    handleSearchChange: ({ performSearch, updateSearchQuery }) => (event) => {
      const query = event.target.value
      updateSearchQuery(query)
      performSearch(query)
    },
  }),
  debounceHandler('performSearch', DEBOUNCE_WAIT),
)(AssetSelector)