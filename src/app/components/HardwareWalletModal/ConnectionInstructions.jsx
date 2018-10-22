import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

const defaultTrezorInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: 'Connect your TREZOR to begin'
  },
  {
    icon: 'fa-unlock',
    text: 'If required, enter your pin or password to unlock the TREZOR'
  },
  {
    icon: 'fa-th-list',
    text: `When shown a list of ${assetName} accounts, select the one you want to use`,
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
    icon: 'fa-mobile',
    text: `Open the ${assetName} app on your Ledger`
  },
]

const assetInstructionOverrides = {
  ledger: {
    ETH: [
      ...defaultLedgerInstructions('Ethereum'),
      {
        icon: 'fa-cogs',
        text: 'Ensure that Browser Support is enabled in Settings'
      },
      {
        icon: 'fa-download',
        text: 'You may need to update the firmware if Browser Support is not available'
      },
    ],
  },
  trezor: {
    ETH: [
      ...defaultTrezorInstructions('Ethereum').slice(0, 2),
      {
        icon: 'fa-window-restore',
        text: (<span>When asked if you want to export the public key, select <b>Export</b></span>)
      },
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
