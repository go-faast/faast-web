import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

const trezorInstructions = () => [
  {
    icon: 'fa-usb',
    text: 'Connect your TREZOR to begin'
  },
  {
    icon: 'fa-unlock',
    text: 'If required, enter your pin or password to unlock the TREZOR'
  },
]

const ledgerInstructions = (assetName) => [
  {
    icon: 'fa-usb',
    text: 'Connect your Ledger Wallet to begin'
  },
  {
    icon: 'fa-mobile',
    text: `Open the ${assetName} app on the Ledger Wallet`
  },
]

const instructions = {
  ledger: {
    ETH: [
      ...ledgerInstructions('Ethereum'),
      {
        icon: 'fa-cogs',
        text: 'Ensure that Browser Support is enabled in Settings'
      },
      {
        icon: 'fa-download',
        text: 'You may need to update the firmware if Browser Support is not available'
      },
    ],
    BTC: ledgerInstructions('Bitcoin'),
  },
  trezor: {
    ETH: [
      ...trezorInstructions(),
      {
        icon: 'fa-window-restore',
        text: (<span>When asked if you want to export the public key, select <b>Export</b></span>)
      },
    ],
    BTC: [
      ...trezorInstructions(),
      {
        icon: 'fa-th-list',
        text: 'When shown a list of accounts, select the one you want to use',
      }
    ]
  }
}

const ConnectionInstructions = ({ type, symbol }) => (
  <table className='mx-0 mx-md-5'>
    <tbody>
      {((instructions[type] || {})[symbol] || []).map(({ icon, text }) => (
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
  type: PropTypes.oneOf(Object.keys(instructions)).isRequired,
  symbol: PropTypes.string.isRequired,
}

export default ConnectionInstructions
