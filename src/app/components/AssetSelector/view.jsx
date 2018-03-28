import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm } from 'redux-form'
import classNames from 'class-names'
import { Row, Col, Form, Button } from 'reactstrap'

import config from 'Config'
import { shortener } from 'Utilities/helpers'

import CoinIcon from 'Components/CoinIcon'
import ReduxFormField from 'Components/ReduxFormField'

import style from './style'

const AssetSearchForm = reduxForm({
  form: 'assetForm'
})(({ handleSubmit, handleSearchChange }) => (
  <Form onSubmit={handleSubmit}>
    <ReduxFormField
      name='searchAsset'
      placeholder='Search by name or symbol...'
      type='search'
      autoFocus
      autoComplete='off'
      onChange={handleSearchChange}
      addonAppend={(
        <Button color='primary' size='md' outline type='submit'>
          <i className='fa fa-search' />
        </Button>
      )}
    />
  </Form>
))

const AssetCol = ({
  asset, handleSelect
}) => {
  const { symbol, name, swapEnabled, hasWalletSupport } = asset
  const disabled = !(swapEnabled && hasWalletSupport)
  const disabledMessage = !swapEnabled ? 'coming soon' : (!hasWalletSupport ? 'unsupported wallet' : 'unavailable')
  return (
    <Col xs='4' lg='3'>
      <Button color='ultra-dark' size='sm' onClick={() => handleSelect(asset)} disabled={disabled}
        className={style.assetButton}>
        <CoinIcon symbol={symbol} size='lg' className={style.assetButtonIcon} />
        <div>{name}</div>
        {disabled && (
          <div className={style.assetDisabledMessage}>{`(${disabledMessage})`}</div>
        )}
      </Button>
    </Col>
  )
}

const AssetSelectorView = ({ assetList, handleSearchSubmit, handleSearchChange, handleSelect }) => (
  <div>
    <AssetSearchForm onSubmit={handleSearchSubmit} handleSearchChange={handleSearchChange}/>
    <Row className={classNames('gutter-1', style.assetButtonContainer)}>
      {assetList.map((a) => (<AssetCol key={a.symbol} asset={a} handleSelect={handleSelect}/>))}
    </Row>
  </div>
)

AssetSelectorView.propTypes = {
  assetList: PropTypes.array,
  handleSelect: PropTypes.func,
  handleSearchSubmit: PropTypes.func,
  handleSearchChange: PropTypes.func
}

export default AssetSelectorView
