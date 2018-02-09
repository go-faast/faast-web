import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { chunkify, shortener } from 'Utilities/helpers'
import styles from './style'
import config from 'Config'

const SearchInput = (props) => (
  <input type='text' autoFocus autoComplete='off' className={styles.inputText} placeholder='search or select your asset' {...props.input} onChange={props.handleChange} value={props.value} />
)

const AssetListView = (props) => {
  const renderAssets = () => {
    const { list, columns, showBalance, handleSelect } = props
    const bsColSize = Math.floor(12 / columns)
    return chunkify(list, columns).map((assetList, i) => {
      return (
        <div key={i} className={`row ${styles.assetListContainerRow}`}>
          {assetList.map((asset, j) => {
            const { symbol, name, balance, swapEnabled, hasWalletSupport } = asset
            const isDisabled = !(swapEnabled && hasWalletSupport)
            const disabledMessage = !swapEnabled ? 'coming soon' : (!hasWalletSupport ? 'unsupported wallet' : 'unavailable')
            return (
              <div key={j} className={`col-4 col-lg-${bsColSize} ${styles.assetListItem} ${isDisabled ? styles.itemDisabled : ''}`} onClick={() => handleSelect(asset)}>
                <div className={styles.assetListItemIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
                <div>{name}</div>
                {isDisabled && (
                  <div style={{ fontSize: 9 }}>{`(${disabledMessage})`}</div>
                )}
                {showBalance &&
                  <div>{!!balance && (<span>({shortener(balance.converted, 12)} {symbol})</span>)}</div>
                }
              </div>
            )
          })}
        </div>
      )
    })
  }

  return (
    <div className={styles.container} id='select-asset-container'>
      <div className={styles.searchContainer}>
        <form onSubmit={props.handleSubmit}>
          <Field name='searchAsset' component={SearchInput} value={props.searchValue} handleChange={props.handleSearchChange} />
        </form>
        <div className={styles.closeButtonContainer} onClick={props.handleClose}>
          <div className={styles.closeButton}>X</div>
        </div>
      </div>
      <div className={styles.clearfix} />
      <div className={styles.assetListContainer}>
        {renderAssets()}
      </div>
    </div>
  )
}

AssetListView.propTypes = {
  columns: PropTypes.number,
  input: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  list: PropTypes.array,
  handleSelect: PropTypes.func,
  showBalance: PropTypes.bool,
  handleSubmit: PropTypes.func,
  searchValue: PropTypes.string,
  handleSearchChange: PropTypes.func
}

AssetListView.defaultProps = {
  columns: 6,
}

export default reduxForm({
  form: 'assetForm'
})(AssetListView)
