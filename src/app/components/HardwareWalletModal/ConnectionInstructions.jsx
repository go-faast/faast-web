import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

const defaultTrezorInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: 'Connect your TREZOR to begin'
  },
  {
    icon: 'fa-refresh',
    text: 'Ensure your TREZOR firmware is up to date using the TREZOR wallet website'
  },
  {
    icon: 'fa-unlock',
    text: 'If required, enter your pin or password to unlock the TREZOR'
  },
  {
    icon: 'fa-window-restore',
    text: (<span>When asked if you want to export the public key of your {assetName} account, select <b>Export</b></span>)
  },
  {
    icon: 'fa-exclamation-triangle',
    text: 'If you see a "Popup Closed" error, please enable popups in your browser settings and try again'
  }
]

const defaultLedgerInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: 'Connect your Ledger device to begin'
  },
  {
    icon: 'fa-unlock',
    text: 'Enter your pin to unlock the Ledger'
  },
  {
    icon: 'fa-refresh',
    text: `Ensure your Ledger firmware and ${assetName} app are up to date using the Ledger Live desktop app`
  },
  {
    icon: 'fa-mobile',
    text: `Open the ${assetName} app on your Ledger`
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
      {getInstructions(type, asset).map(({ icon, text }) => (
        <tr key={text}>
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
