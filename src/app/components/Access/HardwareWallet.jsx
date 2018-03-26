import React from 'react'
import PropTypes from 'prop-types'

import ledgerLogo from 'Img/wallet/ledger-logo.png'
import trezorLogo from 'Img/wallet/trezor-logo.png'

import withToggle from 'Hoc/withToggle'
import HardwareWalletModal from 'Components/HardwareWalletModal'

import AccessTile from './AccessTile'

const walletTypes = {
  ledger: {
    name: 'Ledger Wallet',
    icon: ledgerLogo,
    supportedAssets: ['ETH'],
    instructions: [{
      icon: 'fa-usb',
      text: 'Connect your Ledger Wallet to begin'
    }, {
      icon: 'fa-mobile',
      text: 'Open the Ethereum app on the Ledger Wallet'
    }, {
      icon: 'fa-cogs',
      text: 'Ensure that Browser Support is enabled in Settings'
    }, {
      icon: 'fa-download',
      text: 'You may need to update the firmware if Browser Support is not available'
    }]
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
    supportedAssets: ['BTC', 'ETH'],
    instructions: [{
      icon: 'fa-usb',
      text: 'Connect your TREZOR to begin'
    }, {
      icon: 'fa-external-link-square',
      text: (<span>When the popop asks if you want to export the public key, select <b>Export</b></span>)
    }, {
      icon: 'fa-unlock',
      text: 'If required, enter your pin or password to unlock the TREZOR'
    }]
  }
}

const HardwareWallet = ({ type, isModalOpen, setModalOpen }) => {
  const { name, icon, supportedAssets, instructions } = walletTypes[type]
  return (
    <div>
      <AccessTile name={name} icon={icon} assets={supportedAssets} onClick={() => setModalOpen(true)} color='primary' outline/>
      <HardwareWalletModal
        type={type}
        name={name}
        instructions={instructions}
        isOpen={isModalOpen}
        setOpen={setModalOpen}
      />
    </div>
  )
}

HardwareWallet.propTypes = {
  type: PropTypes.oneOf(Object.keys(walletTypes)).isRequired,
}

export default withToggle('modalOpen')(HardwareWallet)
      