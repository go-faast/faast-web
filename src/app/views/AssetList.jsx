import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { chunkify, shortener } from 'Utilities/helpers'
import styles from 'Styles/AssetList.scss'

const SearchInput = (props) => (
  <input type='text' autoFocus autoComplete='off' className={styles.inputText} placeholder='search or select your asset' {...props.input} onChange={props.handleChange} value={props.value} />
)

const AssetList = (props) => {
  const renderAssets = () => {
    const { list, isAvailableTest, columns, ignoreUnavailable, showBalance, handleSelect } = props
    const bsColSize = Math.floor(12 / columns)
    return chunkify(list, columns).map((assetList, i) => {
      return (
        <div key={i} className={`row ${styles.assetListContainerRow}`}>
          {assetList.map((asset, j) => {
            const isUnavailable = !(ignoreUnavailable || isAvailableTest(asset))
            return (
              <div key={j} className={`col-4 col-lg-${bsColSize} ${styles.assetListItem} ${isUnavailable ? styles.itemDisabled : ''}`} onClick={() => handleSelect(asset)}>
                <div className={styles.assetListItemIcon} style={{ backgroundImage: `url(https://faa.st/img/coins/coin_${asset.symbol}.png)` }} />
                <div>{asset.name}</div>
                {isUnavailable &&
                  <div style={{ fontSize: 9 }}>(coming soon)</div>
                }
                {showBalance &&
                  <div>{!!asset.balance && (<span>({shortener(asset.balance.converted, 12)} {asset.symbol})</span>)}</div>
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

AssetList.propTypes = {
  columns: PropTypes.number,
  input: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  list: PropTypes.array,
  handleSelect: PropTypes.func,
  ignoreUnavailable: PropTypes.bool,
  isAvailableTest: PropTypes.func,
  showBalance: PropTypes.bool,
  handleSubmit: PropTypes.func,
  searchValue: PropTypes.string,
  handleSearchChange: PropTypes.func
}

AssetList.defaultProps = {
  columns: 6,
}

export default reduxForm({
  form: 'assetForm'
})(AssetList)
