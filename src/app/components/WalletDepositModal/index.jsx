import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, withState } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { getWalletForAsset } from 'Utilities/wallet'
import { pick } from 'lodash'
import { getAsset } from 'Selectors/asset'
import CoinIcon from 'Components/CoinIcon'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import DepositQRCode from 'Components/DepositQRCode'
import Loading from 'Components/Loading'

export default compose(
  setDisplayName('WalletDepositModal'),
  setPropTypes({
    walletId: PropTypes.string.isRequired,
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    asset: (state, { symbol }) => getAsset(state, symbol),
  }), {
  }),
  withState('address', 'updateAddress', ''),
  lifecycle({
    async componentDidMount() {
      const { walletId, symbol, updateAddress } = this.props
      const walletInstance = getWalletForAsset(walletId, symbol)
      const address = await walletInstance.getFreshAddress(symbol)
      updateAddress(address)
    }
  })
)(({ toggle, symbol, asset, address, ...props, }) => { 
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
        <h5>Your {asset.name} address:</h5>
        {address ? (
          <Fragment>
            <DepositQRCode 
              className='my-2' 
              scan={false}
              size={120} 
              address={address} 
              asset={asset}
            />
            <ClipboardCopyField value={address} />
          </Fragment>
        ) : (
          <Loading className='py-3' label={'Loading...'} center />
        )}
      </ModalBody>
    </Modal>
  )
})
