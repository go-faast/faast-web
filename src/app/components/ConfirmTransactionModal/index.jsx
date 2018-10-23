import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

import {
  EthereumWalletWeb3, EthereumWalletLedger, EthereumWalletTrezor,
} from 'Services/Wallet'

import LedgerEthInstructions from './LedgerEthInstructions'
import LedgerBtcInstructions from './LedgerBtcInstructions'
import TrezorEthInstructions from './TrezorEthInstructions'
import TrezorBtcInstructions from './TrezorBtcInstructions'
import Web3Instructions from './Web3Instructions'

const instructionComponentMap = {
  [EthereumWalletWeb3.type]: Web3Instructions,
  [EthereumWalletLedger.type]: LedgerEthInstructions,
  [EthereumWalletTrezor.type]: TrezorEthInstructions,
}

function getInstructionComponent(walletType) {
  const instructionComponent = instructionComponentMap[walletType]
  if (instructionComponent) {
    return instructionComponent
  }
  walletType = walletType.toLowerCase()
  if (walletType.includes('ledger')) {
    return LedgerBtcInstructions
  }
  if (walletType.includes('trezor')) {
    return TrezorBtcInstructions
  }
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
    const InstructionComponent = swap && swap.tx && swap.tx.type && getInstructionComponent(swap.tx.type)
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
        <InstructionComponent tx={swap.tx}/>
      )}
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
    </ModalFooter>
  </Modal>
))
