/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import T from 'Components/i18n/T'

const defaultTrezorInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.trezor.connect'>Connect your TREZOR to begin</T>
  },
  {
    icon: 'fa-refresh',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.trezor.version'>Ensure your TREZOR firmware is up to date using the TREZOR wallet website</T>
  },
  {
    icon: 'fa-unlock',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.trezor.pin'>If required, enter your pin or password to unlock the TREZOR</T>
  },
  {
    icon: 'fa-window-restore',
    text: (<T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.trezor.export'>When asked if you want to export the public key of your {assetName} account, select <b>Export</b></T>)
  },
  {
    icon: 'fa-exclamation-triangle',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.trezor.popup'>If you see a "Popup Closed" error, please enable popups in your browser settings and try again</T>
  }
]

const defaultLedgerInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.ledger.connect'>Connect your Ledger device to begin</T>
  },
  {
    icon: 'fa-unlock',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.ledger.pin'>Enter your pin to unlock the Ledger</T>
  },
  {
    icon: 'fa-refresh',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.ledger.version'>Ensure your Ledger firmware and {assetName} app are up to date using the Ledger Live desktop app</T>
  },
  {
    icon: 'fa-mobile',
    text: <T tag='span' i18nKey='app.hardwareWalletModal.connectionInstructions.ledger.open'>Open the {assetName} app on your Ledger</T>
  },
]

const assetInstructionOverrides = {
  ledger: {
    ETH: [
      ...defaultLedgerInstructions('Ethereum'),
    ],
  },
  trezor: {
    ETH: [
      ...defaultTrezorInstructions('Ethereum'),
    ],
  }
}

const defaultInstructionCreators = {
  ledger: defaultLedgerInstructions,
  trezor: defaultTrezorInstructions,
}

function getInstructions(type, asset) {
  const inst = (assetInstructionOverrides[type] || {})[asset.symbol]
  if (inst) {
    return inst
  }
  const instCreator = defaultInstructionCreators[type]
  if (instCreator) {
    return instCreator(asset.name)
  }
  return []
}

const ConnectionInstructions = ({ type, asset }) => (
  <table className='mx-0 mx-md-5'>
    <tbody>
      {getInstructions(type, asset).map(({ icon, text }, i) => (
        <tr key={i}>
          <td className='text-center'>
            <i className={classNames('fa fa-2x', icon)} />
          </td>
          <td className='text-left p-3'>
            {text}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

ConnectionInstructions.propTypes = {
  type: PropTypes.oneOf(Object.keys(defaultInstructionCreators)).isRequired,
  asset: PropTypes.shape({
    symbol: PropTypes.string,
    name: PropTypes.string,
  })
}

export default ConnectionInstructions
