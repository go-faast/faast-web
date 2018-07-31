import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

import {
  EthereumWalletLedger, EthereumWalletTrezor,
  BitcoinWalletLedger, BitcoinWalletTrezor, EthereumWalletWeb3
} from 'Services/Wallet'

import LedgerEthInstructions from './LedgerEthInstructions'

const supportedTypes = {
  [EthereumWalletWeb3.type]: LedgerEthInstructions,
}

export default compose(
  setDisplayName('ConfirmTransactionModal'),
  setPropTypes({
    swap: PropTypes.object,
  }),
  defaultProps({
    swap: null,
  }),
  withProps(({ swap }) => {
    const InstructionComponent = swap && swap.tx && swap.tx.type && supportedTypes[swap.tx.type]
    return {
      InstructionComponent,
      isOpen: Boolean(swap && InstructionComponent),
    }
  })
)(({ swap, InstructionComponent, handleCancel, isOpen }) => (
  <Modal backdrop='static' isOpen={isOpen}>
    <ModalHeader className='text-primary'>
      Confirm Transaction
    </ModalHeader>
    <ModalBody>
      {InstructionComponent && (
        <InstructionComponent swap={swap}/>
      )}
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
    </ModalFooter>
  </Modal>
))
