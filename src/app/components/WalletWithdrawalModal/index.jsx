import React from 'react'
import toastr from 'Utilities/toastrWrapper'
import { toBigNumber, toNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import PropTypes from 'prop-types'
import { push } from 'react-router-redux'
import { compose, setDisplayName, setPropTypes, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Form, Button } from 'reactstrap'
import { getWallet } from 'Selectors/wallet'
import { pick } from 'lodash'
import { createWithdrawalTx, signAndSubmitTx } from 'Actions/withdrawal'
import { updateHoldings } from 'Actions/portfolio'
import { getAsset } from 'Selectors/asset'
import CoinIcon from 'Components/CoinIcon'
import { withTranslation } from 'react-i18next'
import ReduxFormField from 'Components/ReduxFormField'
import { reduxForm, formValueSelector } from 'redux-form'
import Units from 'Components/Units'

const FORM_NAME = 'wallet_withdrawal'
const getFormValue = formValueSelector(FORM_NAME)

const WalletWithdrawalModal = ({ toggle, handleSubmit, asset, wallet, validateSendAmount,
  validateSendAddress, sendAmount, symbol, handleUpdateSendAmount, receiveAddress, tx, 
  handleSendTx, isSubmitting, ...props, }) => {
  const balance = wallet.balances[symbol] || toBigNumber(0)
  const remainingBalance = balance && balance.minus(toBigNumber(sendAmount))
  return (
    <Modal
      size='md' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader 
        tag='h4' 
        toggle={toggle} 
        style={{ zIndex: 999 }} 
        className='text-primary text-center border-0 pb-0 position-relative'
      >
      </ModalHeader>
      <ModalBody className='px-0 p-sm-3 text-center'>
        <CoinIcon className='mb-3' width={60} height={60} size='' symbol={symbol} />
        {!tx ? (
          <Form onSubmit={handleSubmit}>
            <ReduxFormField
              name='receiveAddress'
              validate={validateSendAddress}
              type='text'
              className='mt-3 mx-auto'
              inputClass='flat border-0 mx-auto'
              inputProps={{ style: { backgroundColor: '#353535', maxWidth: 460 } }}
              placeholder={`Send to ${asset.name} address`}
            />
            <div className='mx-auto' style={{ maxWidth: 560 }}>
              <div className ='position-relative'>
                <ReduxFormField
                  name='sendAmount'
                  validate={validateSendAmount}
                  type='number'
                  min='0'
                  feed
                  className='mt-4 mb-0'
                  inputClass='flat'
                  inputProps={{ style: { borderLeft: 'none', borderRight: 'none', borderTop: 'none' } }}
                  placeholder={'Amount to send'}
                />
                <div className='position-absolute pr-3' style={{ right: 0, top: 3, backgroundColor: '#212121' }}>
                  <Button 
                    onClick={() => handleUpdateSendAmount(toNumber(balance.div(2).toFixed(asset.decimals > 15 ? 15 : asset.decimals)))}
                    size='sm' 
                    color='ultra-dark' 
                    className='flat mr-2'
                    disabled={!balance}
                  >
                    Half
                  </Button>
                  <Button 
                    onClick={() => handleUpdateSendAmount(toNumber(balance))}
                    size='sm' 
                    color='ultra-dark' 
                    className='flat'
                  >
                    All
                  </Button>
                </div>
              </div>
              <div className='text-left position-relative'>
                <Units 
                  value={sendAmount ? toBigNumber(sendAmount).times(asset.price) : 0.00} 
                  precision={6} 
                  currency 
                  prefixSymbol 
                  className='text-muted pl-3'
                  symbolSpaced={false} 
                  style={{ opacity: .75 }}
                />
                <div className='position-absolute pr-3' style={{ right: 0, top: -2, backgroundColor: '#212121' }}>
                  <span className='font-xs text-muted'>Remaining Balance: <Units value={remainingBalance.gt(0) ? remainingBalance : 0} symbol={symbol} decimals={asset.decmals} showSymbol /></span>
                </div>
              </div>
              <Button 
                color='primary' 
                type='submit'
                className='w-100 mt-4 mb-3'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Transaction...' : `Create ${symbol} Transaction`}
              </Button>
            </div>
          </Form>
        ) : (
          <div className='mx-auto' style={{ maxWidth: 500 }}>
            <h2 className='mt-3 mb-3' style={{ fontWeight: 600 }}>Please confirm the following:</h2>
            <p className='px-3 py-2' style={{ backgroundColor: '#181818' }}>
              Send <b>
                <Units 
                  value={sendAmount} 
                  precision={asset.decimals} 
                  symbol={symbol} 
                  showSymbol 
                />
              </b> to {asset.name} address <i>{receiveAddress} </i>
              with a fee of <b>
                <Units 
                  value={tx.feeAmount} 
                  precision={asset.decimals} 
                  symbol={tx.feeSymbol} 
                  showSymbol 
                />?
              </b>
            </p>
            <p className='font-sm text-muted'>** Please make sure your {wallet.typeLabel} wallet is connected and set to the correct account.</p>
            <Button 
              color='primary' 
              onClick={handleSendTx}
              disabled={isSubmitting}
              className='w-100 mt-4 mb-3'
            >
              {isSubmitting ? 'Sending...' : `Send ${symbol}`}
            </Button>
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}

export default compose(
  setDisplayName('WalletWithdrawalModal'),
  withTranslation(),
  setPropTypes({
    walletId: PropTypes.string.isRequired,
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    asset: (state, { symbol }) => getAsset(state, symbol),
    wallet: (state, { walletId }) => getWallet(state, walletId),
    sendAmount: (state) => getFormValue(state, 'sendAmount'),
    receiveAddress: (state) => getFormValue(state, 'receiveAddress')
  }), {
    createWithdrawalTx,
    signAndSubmitTx,
    push,
    updateHoldings
  }),
  withState('address', 'updateAddress', ''),
  withState('tx', 'updateTx', ''),
  withState('isSubmitting', 'updateIsSubmitting', false),
  withHandlers({
    onSubmit: ({ createWithdrawalTx, walletId, updateTx, symbol, receiveAddress, 
      sendAmount, updateIsSubmitting }) => async () => {
      updateIsSubmitting(true)
      const tx = await createWithdrawalTx(walletId, receiveAddress, sendAmount, symbol)
      updateTx(tx)
      updateIsSubmitting(false)
    },
    validateSendAddress: ({ asset, t, wallet, }) => validator.all(
      validator.required(),
      validator.walletAddress(asset, `${t('app.widget.invalid', 'Invalid')} ${asset.symbol} ${t('app.widget.address', 'address')}`),
      ...(wallet.address ? [validator.cannotEqual(wallet.address, 'Cannot send to and from the same address.')] : [])
    ),
    validateSendAmount: ({ wallet, symbol }) => validator.all(
      validator.required(),
      validator.number(),
      validator.greaterThan(0),
      (symbol === 'ETH' ? validator.lt(wallet.balances[symbol], 'Cannot send whole ETH amount due to gas fee.') : validator.lte(wallet.balances[symbol], 'Cannot send more than you have.')),
    )
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withHandlers({
    handleSendTx: ({ tx, signAndSubmitTx, push, symbol, updateIsSubmitting, updateHoldings, walletId }) => async () => {
      updateIsSubmitting(true)
      try {
        await signAndSubmitTx(tx, {})
        updateHoldings(walletId)
        push(`/wallets/${symbol}`)
        updateIsSubmitting(false)
      } catch (err) {
        toastr.error(err.message)
        updateIsSubmitting(false)
      }
    },
    handleUpdateSendAmount: ({ change }) => (value) => {
      change('sendAmount', value)
    },
  }),
)(WalletWithdrawalModal)
