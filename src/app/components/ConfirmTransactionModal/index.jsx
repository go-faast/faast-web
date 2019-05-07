import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

import {
  EthereumWalletLedger, EthereumWalletTrezor, EthereumWalletKeystore,
} from 'Services/Wallet'

import LedgerEthInstructions from './LedgerEthInstructions'
import LedgerBtcInstructions from './LedgerBtcInstructions'
import TrezorEthInstructions from './TrezorEthInstructions'
import TrezorBtcInstructions from './TrezorBtcInstructions'
import MetaMaskInstructions from './MetaMaskInstructions'
import EthereumInstructions from './EthereumInstructions'
import WalletPasswordPrompt from 'Components/WalletPasswordPrompt'
import T from 'Components/i18n/T'

const instructionComponentMap = {
  [EthereumWalletLedger.type]: LedgerEthInstructions,
  [EthereumWalletTrezor.type]: TrezorEthInstructions,
  [EthereumWalletKeystore.type]: WalletPasswordPrompt,
}

function getInstructionComponent(tx, wallet) {
  const instructionComponent = instructionComponentMap[wallet.type]
  if (instructionComponent) {
    return instructionComponent
  }
  const walletType = wallet.type.toLowerCase()
  if (walletType.includes('ledger')) {
    return LedgerBtcInstructions
  }
  if (walletType.includes('trezor')) {
    return TrezorBtcInstructions
  }
  if (walletType.includes('ethereum')) {
    if (wallet.typeLabel.toLowerCase().includes('metamask')) {
      return MetaMaskInstructions
    }
    return EthereumInstructions
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
    const InstructionComponent = swap && getInstructionComponent(swap.tx, swap.sendWallet)
    return {
      InstructionComponent,
      isOpen: Boolean(swap && InstructionComponent),
    }
  })
)(({ swap, InstructionComponent, handleCancel, isOpen }) => (
  <Modal backdrop='static' isOpen={isOpen}>
    <ModalHeader className='text-primary'>
      <T tag='span' i18nKey='app.confirmTransactionModal.title'>Confirm Transaction</T>
    </ModalHeader>
    <ModalBody>
      {InstructionComponent && (
        <InstructionComponent tx={swap.tx}/>
      )}
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>
        <T tag='span' i18nKey='app.confirmTransactionModal.cancel'>Cancel</T>
      </Button>
    </ModalFooter>
  </Modal>
))
