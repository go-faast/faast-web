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
    const type = props.type
    const columns = props.columns || 6
    const bsColSize = Math.floor(12 / columns)
    return chunkify(props.list, columns).map((a, i) => {
      return (
        <div key={i} className={`row ${styles.assetListContainerRow}`}>
          {a.map((b, j) => {
            return (
              <div key={j} className={`col-4 col-lg-${bsColSize} ${styles.assetListItem}`} onClick={() => props.handleSelect(b)}>
                <div className={styles.assetListItemIcon} style={{ backgroundImage: `url(https://faa.st/img/coins/coin_${b.symbol}.png)` }} />
                <div>{b.name}</div>
                {!props.ignoreUnavailable && !b[type] &&
                  <div style={{ fontSize: 9 }}>(coming soon)</div>
                }
                {props.showBalance &&
                  <div>{!!b.balance && (<span>({shortener(b.balance.converted, 12)} {b.symbol})</span>)}</div>
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
  type: PropTypes.string,
  columns: PropTypes.number,
  input: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  list: PropTypes.array,
  handleSelect: PropTypes.func,
  ignoreUnavailable: PropTypes.bool,
  showBalance: PropTypes.bool,
  handleSubmit: PropTypes.func,
  searchValue: PropTypes.string,
  handleSearchChange: PropTypes.func
}

export default reduxForm({
  form: 'assetForm'
})(AssetList)
