import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import classNames from 'class-names'
import { Row, Col } from 'reactstrap'

import { shortener } from 'Utilities/helpers'
import styles from './style'
import config from 'Config'

const SearchInput = (props) => (
  <input
    type='text'
    autoFocus
    autoComplete='off'
    className={styles.inputText}
    placeholder='search or select your asset'
    {...props.input}
    onChange={props.handleChange}
    value={props.value}
  />
)

const AssetListView = (props) => {
  const renderAssets = () => {
    const { list, columns, showBalance, handleSelect } = props
    const bsColSize = `${Math.floor(12 / columns)}`
    return (
      <Row className={classNames('gutter-1', styles.assetListContainerRow)}>
        {list.map((asset, i) => {
          const { symbol, name, balance, swapEnabled, hasWalletSupport } = asset
          const isDisabled = !(swapEnabled && hasWalletSupport)
          const disabledMessage = !swapEnabled ? 'coming soon' : (!hasWalletSupport ? 'unsupported wallet' : 'unavailable')
          return (
            <Col xs='4' lg={bsColSize} key={i} onClick={() => handleSelect(asset)}
              className={classNames(styles.assetListItem, { [styles.itemDisabled]: isDisabled })}>
              <div className={styles.assetListItemInner}>
                <img src={`${config.siteUrl}/img/coins/coin_${symbol}.png`} className={styles.assetListItemIcon} />
                <div>{name}</div>
                {isDisabled && (
                  <div style={{ fontSize: 9 }}>{`(${disabledMessage})`}</div>
                )}
                {showBalance &&
                  <div>{!!balance && (<span>({shortener(balance.converted, 12)} {symbol})</span>)}</div>
                }
              </div>
            </Col>
          )
        })}
      </Row>
    )
  }

  return (
    <div className={styles.container} id='select-asset-container'>
      <div className={styles.searchContainer}>
        <form onSubmit={props.handleSubmit}>
          <Row className='gutter-0'>
            <Col>
              <Field name='searchAsset' component={SearchInput} value={props.searchValue} handleChange={props.handleSearchChange} />
            </Col>
            <Col xs='auto'>
              <div className={styles.closeButtonContainer} onClick={props.handleClose}>
                <div className={styles.closeButton}>✕</div>
              </div>
            </Col>
          </Row>
        </form>
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

export default reduxForm({
  form: 'assetForm'
})(AssetListView)
