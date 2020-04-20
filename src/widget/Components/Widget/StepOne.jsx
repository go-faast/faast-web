import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector, SubmissionError } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import {
  Form, Button, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText, Alert
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import * as qs from 'query-string'
import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'
import { saveSwapWidgetInputs } from 'Actions/app'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumWithdrawal,
  getRateMaximumDeposit, rateError, isRateStale, getRateMinimumWithdrawal } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit, getSavedSwapWidgetInputs } from 'Selectors/app'
import extraAssetFields from 'Config/extraAssetFields'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Src/app/components/AssetSelectorList'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import { toChecksumAddress } from 'Utilities/convert'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import debounceHandler from 'Hoc/debounceHandler'

import SwapIcon from 'Img/swap-icon.svg?inline'

import style from './style.scss'
import Faast from 'Src/services/Faast'

const DEFAULT_SEND_SYMBOL = 'BTC'
const DEFAULT_RECEIVE_SYMBOL = 'ETH'
const DEFAULT_SEND_AMOUNT = 1
const FORM_NAME = 'embedWidget'
const DEBOUNCE_WAIT = 5000 // ms

const getFormValue = formValueSelector(FORM_NAME)

const StepOneField = withProps(({ labelClass, inputClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass),
  inputClass: classNames(inputClass),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', sm: '3', md: '2', lg: '12', className: 'text-left text-sm-right text-lg-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapStepOne = ({ sendSymbol, receiveSymbol, setAssetSelect, 
  assetSelect, assetSymbols, onCloseAssetSelector, isAssetDisabled, handleSelectedAsset }) => {
  return (
    <Fragment>
      <Form onSubmit={() => {}}>
        <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
          <CardHeader className='text-center'>
              Swap Instantly
          </CardHeader>
          <CardBody className='pt-3'>
            <Row className='gutter-0'>
              <Col className='position-relative' xs={{ size: 12, order: 1 }} lg>
                {assetSelect === 'send' && (
                  <div className={style.assetListContainer}>
                    <AssetSelector 
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
                    />
                  </div>
                )}
                <StepOneField
                  name='sendAmount'
                  type='number'
                  step='any'
                  placeholder={'Send amount'}
                  label={'You send'}
                  fixedFeedback
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('send')}>
                        <CoinIcon key={sendSymbol} symbol={sendSymbol} size={1.25} className='mr-2'/>
                        {sendSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                />
              </Col>
              <Col xs={{ size: 12, order: 3 }} lg={{ size: 1, order: 2 }} className='text-right text-lg-center'>
                <Button color='primary' onClick={() => {}} className={style.reverse}>
                  <SwapIcon/>
                </Button>
              </Col>
              <Col xs={{ size: 12, order: 4 }} lg={{ size: true, order: 3 }}>
                {assetSelect === 'receive' && (
                  <div className={style.assetListContainer}>
                    <AssetSelector 
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
                    />
                  </div>
                )}
                <StepOneField
                  name='receiveAmount'
                  type='number'
                  step='any'
                  placeholder={'Receive amount'}
                  label={'You send'}
                  fixedFeedback
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('receive')}>
                        <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                        {receiveSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
        <Button>Continue</Button>
      </Form>
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapStepOne'),
  setPropTypes({
    sendSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
    defaultSendAmount: PropTypes.number,
    defaultReceiveAmount: PropTypes.number,
    defaultRefundAddress: PropTypes.string,
    defaultReceiveAddress: PropTypes.string,
  }),
  defaultProps({
    sendSymbol: DEFAULT_SEND_SYMBOL,
    receiveSymbol: DEFAULT_RECEIVE_SYMBOL,
    defaultSendAmount: DEFAULT_SEND_AMOUNT,
    defaultReceiveAmount: null,
    defaultRefundAddress: undefined,
    defaultReceiveAddress: undefined,
  }),
  withState('assetSelect', 'setAssetSelect', null),
  connect(createStructuredSelector({
    assetSymbols: getAllAssetSymbols,
    sendAsset: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    sendAmount: (state) => getFormValue(state, 'sendAmount'),
    receiveAmount: (state) => getFormValue(state, 'receiveAmount'),
    refundAddress: (state) => getFormValue(state, 'refundAddress'),
    receiveAddress: (state) => getFormValue(state, 'receiveAddress'),
    receiveWallet: (state) => getWallet(state, getFormValue(state, 'receiveWalletId')),
    sendWallet: (state) => getWallet(state, getFormValue(state, 'sendWalletId')),
    balancesLoaded: areCurrentPortfolioBalancesLoaded,
    limit: getGeoLimit,
  }), {
    createSwap: createSwapAction,
    retrievePairData: retrievePairData,
  }),
  withHandlers({
    onCloseAssetSelector: ({ setAssetSelect }) => () => {
      setAssetSelect(null)
    },
    handleSelectedAsset: ({ assetSelect, updateURLParams, setAssetSelect, sendSymbol, receiveSymbol }) => (asset) => {
      const { symbol } = asset
      let from = sendSymbol
      let to = receiveSymbol
      if (assetSelect === 'send') {
        if (symbol === receiveSymbol) {
          to = from
        }
        from = symbol
      } else { // receive
        if (symbol === sendSymbol) {
          from = to
        }
        to = symbol
      }
      setAssetSelect(null)
      updateURLParams({ from, to })
    },
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(SwapStepOne)
