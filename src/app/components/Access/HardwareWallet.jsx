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
    supportedAssets: ['ETH']
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
    supportedAssets: ['BTC', 'ETH']
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
      