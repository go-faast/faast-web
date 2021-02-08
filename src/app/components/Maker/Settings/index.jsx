import React, { Fragment } from 'react'
import { pick } from 'lodash'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withHandlers, withState, withProps, lifecycle } from 'recompose'
import { Row, Col, Card, Input, CardHeader, CardBody, Button, Form } from 'reactstrap'
import classNames from 'class-names'
import Checkbox from 'Components/Checkbox'
import AssetSelector from 'Components/AssetSelectorList'
import { reduxForm, formValueSelector } from 'redux-form'

import { makerId, getMakerProfile, isMakerDisabled, isAbleToRetractCapacity } from 'Selectors/maker'
import { getAllAssetsArray } from 'Common/selectors/asset'
import { disableMaker, enableMaker, updateMaker } from 'Actions/maker'
import Toastr from 'Utilities/toastrWrapper'

import MakerLayout from 'Components/Maker/Layout'
import CoinIcon from 'Components/CoinIcon'
import { card, cardHeader, input, text, smallCard } from '../style'
import style from './style.scss'

const FORM_NAME = 'maker_asset_select'
const getFormValue = formValueSelector(FORM_NAME)

const MakerSettings = ({ makerId, isMakerDisabled, handleSwitch, isAbleToRetractCapacity, selectedAssets, selectedAssetsHaveChanged,
  toggleAssetSelector, isAssetDisabled, isAssetSelectorOpen, handleSelectedAsset, assetList, handleSubmit, isLoading, push,
  selectedAssetsDoesHaveERC20, assetCheckbox, removeAsset, profile: { swapMarginMin, swapMarginMax } = {} }) => {
  return (
    <MakerLayout className='pt-3'>
      <Row className='mt-4'>
        <Col>
          <Card className={classNames('mx-auto', card, smallCard)}>
            <CardHeader className={cardHeader}>Maker Settings</CardHeader>
            <CardBody>
              <Row className='gutter-y-3'>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-2 font-weight-bold', text)}>Maker ID</p></small>
                  <Input className={classNames('flat', input)} value={makerId} type='text' autoFocus readOnly/>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Supported Assets</p></small>
                  <small className={classNames(text, 'd-block')}>Please remember you will be exposed to the price changes of assets you support.</small>
                  {selectedAssetsDoesHaveERC20(selectedAssets) && <small className={classNames(text, 'd-block')}>(ETH is required as it used to pay fees)</small>}
                  {selectedAssets && selectedAssets.length > 0 && (
                    <Fragment>
                      {selectedAssets && selectedAssets.map(sym => (
                        <div className='px-3 py-2 d-inline-block my-2 mr-2 text-center cursor-pointer' style={{ border: '1px solid #ebeff1', borderRadius: 2 }} key={sym}>
                          <span className={text}><CoinIcon symbol={sym} size='sm' className='mr-2'/>{sym}</span>
                          {selectedAssetsDoesHaveERC20(selectedAssets) && sym == 'ETH' || selectedAssets.length == 1 ? null : (
                            <span className={classNames(text, 'ml-3')} onClick={() => removeAsset(sym)}>✕</span>
                          )}
                        </div>
                      ))}
                    </Fragment>
                  )}
                  {!assetCheckbox && (
                    <Button size='sm' color='light' className={classNames('d-block flat ml-1 mt-2 mb-3', text)} onClick={() => toggleAssetSelector(true)}>
                      Add More Assets
                    </Button>
                  )}
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
                  <Form onSubmit={handleSubmit}>
                    <div className='mt-2 mb-4'>
                      <Checkbox
                        required={false}
                        checked={assetCheckbox}
                        name='assetCheckbox'
                        label={
                          <span className={text}>I would like to fulfill trades for all available assets.</span>
                        }
                        labelClass='p-0'
                      />
                    </div>
                    <Button
                      className='flat'
                      color='primary'
                      disabled={isLoading || selectedAssetsHaveChanged()} 
                      type='submit'
                    >
                      {!isLoading ? 'Update Supported Assets' : 'Loading...'}
                    </Button>
                  </Form>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>{isMakerDisabled ? 'Enable' : 'Disable'} Maker</p></small>
                  <small><p className={classNames('mt-1 mb-1', text)}>Your maker is currently {!isMakerDisabled ? 'enabled.' : 'disbaled.'} Toggle below to turn your maker {!isMakerDisabled ? 'off' : 'on'} and {!isMakerDisabled ? 'stop' : 'begin'} accepting new swaps to fulfill.</p></small>
                  <div className='mt-2'>
                    <label className={style.switcher}>
                      <input type='checkbox' onClick={handleSwitch} checked={!isMakerDisabled} />
                      <span className={classNames(style.slider, style.round)}></span>
                    </label>
                  </div>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Reduce BTC Capacity</p></small>
                  <ol className={classNames(text, 'font-sm pl-4')}>
                    <li>Disable Maker</li>
                    <li>Wait 72 hours (Your maker must be disabled for 72 hours to ensure all of your in progress trades have been completed before withdrawing)</li>
                    <li>Click the button below and enter the amount you would like to reduce</li>
                  </ol>
                  <small><p className={classNames(text, 'font-weight-bold')}>* Reducing your capacity moves BTC from your capacity wallet to your exchange account. This reduces the maximum value of swaps you can fulfill at any one time.</p></small>
                  <Button 
                    color='primary' 
                    size='md' 
                    className='flat'
                    onClick={() => push('/makers/settings/retract')}
                    disabled={!isAbleToRetractCapacity}
                  >
                    Reduce Capacity
                  </Button>
                </Col>
                {swapMarginMin && swapMarginMax ? (
                  <Fragment>
                    <hr className='w-100 border-light'/>
                    <Col sm='12'>
                      <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Margin Range</p></small>
                      <span className={text}>Your maker will fulfill any swaps with a margin of <b>{swapMarginMin}%</b> - <b>{swapMarginMax}%.</b></span>
                    </Col>
                  </Fragment>
                ) : null}
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Have a question?</p></small>
                  <span className={text}>Email us at support@faa.st</span>
                </Col>
              </Row>
            </CardBody>
          </Card>
          {/* <Link to='/makers/terms' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold font-xs text-center'>
              Read the Faa.st Maker Terms
          </Link> */}
        </Col>
      </Row>
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('MakerSettings'),
  connect(createStructuredSelector({
    makerId,
    profile: getMakerProfile,
    assetCheckbox: (state) => getFormValue(state, 'assetCheckbox'),
    isMakerDisabled,
    isAbleToRetractCapacity,
    assets: getAllAssetsArray,
  }), {
    push,
    disableMaker,
    enableMaker,
    updateMaker
  }),
  withProps(({ assets, profile }) => ({
    initialValues: { assetCheckbox: profile && !profile.assetsEnabled },
    assetList: assets ? assets.filter(({ deposit, receive }) => deposit && receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'marketCap', 'ERC20')) : []
  })),
  withState('selectedAssets', 'updateSelectedAssets', ({ profile: { assetsEnabled } = [] }) => assetsEnabled),
  withState('isAssetSelectorOpen', 'toggleAssetSelector', false),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    handleSwitch: ({ isMakerDisabled, disableMaker, enableMaker }) => () => {
      if (isMakerDisabled) {
        enableMaker()
      } else {
        disableMaker()
      }
    },
    onSubmit: ({ updateIsLoading, selectedAssets, updateMaker, assetCheckbox }) => async () => {
      selectedAssets = selectedAssets && selectedAssets.length == 0 || assetCheckbox ? null : selectedAssets
      updateIsLoading(true)
      await updateMaker({ assetsEnabled: selectedAssets })
      Toastr.success('You have successfully updated your enabled assets.')
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
    selectedAssetsHaveChanged: ({ profile: { assetsEnabled }, selectedAssets }) => () => {
      if (!assetsEnabled) assetsEnabled = []
      if (!selectedAssets) selectedAssets = []
      return assetsEnabled.sort().join(',') === selectedAssets.sort().join(',')
    }
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      const { assetCheckbox, updateSelectedAssets, profile } = this.props
      if (assetCheckbox && !prevProps.assetCheckbox) {
        updateSelectedAssets([])
      } else if (!assetCheckbox && prevProps.assetCheckbox) {
        updateSelectedAssets(profile.assetsEnabled)
      }
    }
  })
)(MakerSettings)
