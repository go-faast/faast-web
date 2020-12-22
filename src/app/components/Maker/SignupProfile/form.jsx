import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { pick } from 'lodash'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, lifecycle, setDisplayName, withHandlers, withState, withProps } from 'recompose'
import { Form, Button, Row, Col } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import AssetSelector from 'Components/AssetSelectorList'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import T from 'Components/i18n/T'
import { isMakerLoggedIn } from 'Selectors/maker'
import classNames from 'class-names'
import { getAllAssetsArray } from 'Common/selectors/asset'
import generate from 'project-name-generator'
import { toTitleCase } from 'Utilities/display'
import * as validator from 'Utilities/validator'

const FORM_NAME = 'maker_signup'

const getFormValue = formValueSelector(FORM_NAME)

import { input, text } from '../style'

import { registerMaker } from 'Actions/maker'

const MakerSignupForm = ({ handleSubmit, randomNames, generateRandomNames, updateMakerName,
  validateRequired, publicName, handleSelectedAsset, isAssetDisabled, assetCheckbox, 
  selectedAssetsDoesHaveERC20, isAssetSelectorOpen, toggleAssetSelector, assetList, 
  selectedAssets, removeAsset, isLoading }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='publicName'
        type='hidden'
        className='mb-0'
        validate={validateRequired}
        readonly
        placeholder='Public Maker Name'
        inputClass={classNames('flat mb-0', input)}
      />
      {randomNames.length > 0 && (
        <Fragment>
          <p className={classNames('mt-0 mb-0 pb-0 font-weight-bold', text)}>Public Maker Name</p>
          <small className={text}>Choose a maker name from the options below.</small>
          <Row className='mx-1 mt-2'>
            {randomNames.map((name, i) => {
              const selected = publicName == name
              return (
                <Col 
                  className={classNames('p-2 text-center cursor-pointer mb-1', i < randomNames.length - 1 && 'mr-1')}
                  style={{ border: selected ? '1px solid #008472' : '1px solid #ccc', borderRadius: 2, color: selected ? '#008472' : '#525252' }}
                  onClick={() => updateMakerName(name)} 
                  xs='5'
                  key={name}
                >
                  <small>{name}</small>
                </Col>
              )
            })}
          </Row>
          <Button size='sm' color='primary' className={classNames('d-block flat ml-1 mt-2', text)} onClick={generateRandomNames}>
            <i className='fa fa-refresh' /> Refresh Options
          </Button>
        </Fragment>
      )}
      <p className={classNames('mt-4 mb-0 pb-0 font-weight-bold', text)}>Choose Supported Assets</p>
      <small className={classNames(text, 'd-block')}>Please remember you will be exposed to the price changes of assets you support.</small>
      {selectedAssetsDoesHaveERC20(selectedAssets) && <small className={classNames(text, 'd-block')}>(ETH is required as it used to pay fees)</small>}
      {selectedAssets.length > 0 && !assetCheckbox && (
        <Fragment>
          {selectedAssets.map(sym => (
            <div className='px-3 py-2 d-inline-block my-2 mr-2 text-center cursor-pointer' style={{ border: '1px solid #ebeff1', borderRadius: 2 }} key={sym}>
              <span className={text}><CoinIcon symbol={sym} size='sm' className='mr-2'/>{sym}</span>
              {selectedAssetsDoesHaveERC20(selectedAssets) && sym == 'ETH' ? null : (
                <span className={classNames(text, 'ml-3')} onClick={() => removeAsset(sym)}>✕</span>
              )}
            </div>
          ))}
          <Button size='sm' color='primary' className={classNames('d-block flat ml-1 mt-2 mb-3', text)} onClick={() => toggleAssetSelector(true)}>
          Add More Assets
          </Button>
        </Fragment>
      )}
      <div className='mt-2 mb-4'>
        <Checkbox
          required={false}
          name='assetCheckbox'
          label={
            <span className={text}>I would like to fulfill trades for all available assets.</span>
          }
          labelClass='p-0'
        />
      </div>
      {isAssetSelectorOpen && (
        <AssetSelector 
          selectAsset={handleSelectedAsset} 
          supportedAssetSymbols={assetList}
          isAssetDisabled={isAssetDisabled}
          onlyShowEnabled={true}
          onClose={() => toggleAssetSelector(false)}
          dark={false}
        />
      )}
      <ReduxFormField
        name='exchangesEnabled'
        type='select'
        className='mt-4'
        inputClass={classNames('flat pr-5', input)}
        validate={validateRequired}
        label={<div>
          <p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Choose Supported Exchanges</p>
          <small className={text}>You need to have an exchange account in order to setup your maker.</small>
        </div>}
      >
        <option value='' defaultValue disabled>Select an exchange</option>
        <option value='binance'>Binance</option>
      </ReduxFormField>
      <ReduxFormField
        name='makerId'
        type='hidden'
        placeholder='Maker ID'
        inputClass={classNames('flat', input)}
      />
      <ReduxFormField
        name='fullName'
        type='text'
        validate={validateRequired}
        placeholder='Full Name'
        inputClass={classNames('flat', input)}
        label={
          <div>
            <p className={classNames('mt-3 mb-0 font-weight-bold', text)}>Full Name</p>
            <small className={text}>Write your full name to indicate you accept the terms below.</small>
          </div>
        }
      />
      <div className='mt-2 mb-4'>
        <Checkbox
          label={
            <T tag='small' i18nKey='app.widget.acceptTerm' className={classNames(text,'pl-1')}>I accept the 
              <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faa.st Market Maker Terms & Conditions</a>
            </T>
          }
          labelClass='p-0'
        />
      </div>
      <Button className='w-100 flat' disabled={isLoading} color='primary' type='submit'>{!isLoading ? 'Sign up' : 'Loading...'}</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('MakerSignupForm'),
  connect(createStructuredSelector({
    publicName: (state) => getFormValue(state, 'publicName'),
    assetCheckbox: (state) => getFormValue(state, 'assetCheckbox'),
    assets: getAllAssetsArray,
    isMakerLoggedIn
  }), {
    registerMaker,
    push
  }),
  withProps(({ assets }) => ({
    assetList: assets ? assets.filter(({ deposit, receive }) => deposit && receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'marketCap', 'ERC20')) : []
  })),
  withState('randomNames', 'updateRandomNames', []),
  withState('isLoading', 'updateIsLoading', false),
  withState('selectedAssets', 'updateSelectedAssets', ['BTC']),
  withState('isAssetSelectorOpen', 'toggleAssetSelector', false),
  withHandlers({
    onSubmit: ({ registerMaker, updateIsLoading, selectedAssets }) => async ({ publicName, makerId, fullName, exchangesEnabled }) => {
      selectedAssets = selectedAssets.length == 0 ? null : selectedAssets
      const exchangesArray = [exchangesEnabled]
      updateIsLoading(true)
      await registerMaker({
        publicName,
        makerId,
        fullName,
        assetsEnabled: selectedAssets,
        exchangesEnabled: exchangesArray
      })
      updateIsLoading(false)
    },
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withHandlers({
    updateMakerName: ({ change }) => (name) => {
      change('publicName', name)
    },
    validateEmail: () => validator.all(
      validator.required(),
    ),
    validateRequired: () => validator.all(
      validator.required(),
    ),
  }),
  withHandlers({
    isAssetDisabled: () => ({ deposit, receive }) => !(deposit && receive),
    handleSelectedAsset: ({ selectedAssets, updateSelectedAssets }) => (asset) => {
      const { symbol, ERC20 } = asset
      const arr = [...selectedAssets]
      if (arr.indexOf(symbol) < 0) {
        arr.push(symbol)
      }
      if (ERC20 && arr.indexOf('ETH') < 0) {
        arr.push('ETH')
      }
      updateSelectedAssets(arr)
    },
    selectedAssetsDoesHaveERC20: ({ assetList, selectedAssets }) => () => {
      const hasERC20 = assetList.filter(a => selectedAssets.indexOf(a.symbol) >= 0).some(a => a.ERC20)
      return hasERC20
    },
    removeAsset: ({ selectedAssets, updateSelectedAssets }) => (sym) => {
      const arr = [...selectedAssets]
      const index = arr.indexOf(sym)
      if (index !== -1) {
        arr.splice(index, 1)
        updateSelectedAssets(arr)
      }
    },
    generateRandomNames: ({ updateRandomNames, updateMakerName }) => () => {
      const names = []
      updateMakerName(undefined)
      for (let i = 0; i < 4; i++) {
        names.push(toTitleCase(generate({ words: 3 }).spaced))
      }
      updateRandomNames(names)
    }
  }),
  lifecycle({
    componentDidMount() {
      const { generateRandomNames, isMakerLoggedIn } = this.props
      generateRandomNames()
      if (isMakerLoggedIn) {
        push('/makers/dashbord')
      }
    },
    componentDidUpdate(prevProps) {
      const { publicName, change, assetCheckbox, updateSelectedAssets } = this.props
      if (publicName !== prevProps.publicName) {
        change('makerId', publicName.replace(/\s/g,''))
      }
      if (assetCheckbox && !prevProps.assetCheckbox) {
        updateSelectedAssets([])
      } else if (!assetCheckbox && prevProps.assetCheckbox) {
        updateSelectedAssets(['ETH'])
      }
    }
  }),
)(MakerSignupForm)
