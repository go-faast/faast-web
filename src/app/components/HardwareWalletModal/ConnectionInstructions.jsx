import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

const instructions = {
  ledger: [
    {
      icon: 'fa-usb',
      text: 'Connect your Ledger Wallet to begin'
    },
    {
      icon: 'fa-mobile',
      text: 'Open the Ethereum app on the Ledger Wallet'
    },
    {
      icon: 'fa-cogs',
      text: 'Ensure that Browser Support is enabled in Settings'
    },
    {
      icon: 'fa-download',
      text: 'You may need to update the firmware if Browser Support is not available'
    }
  ],
  trezor: [
    {
      icon: 'fa-usb',
      text: 'Connect your TREZOR to begin'
    },
    {
      icon: 'fa-window-restore',
      text: (<span>When the popop asks if you want to export the public key, select <b>Export</b></span>)
    },
    {
      icon: 'fa-unlock',
      text: 'If required, enter your pin or password to unlock the TREZOR'
    }
  ]
}

const ConnectionInstructions = ({ type }) => (
  <table className='mx-0 mx-md-5'>
    <tbody>
      {instructions[type].map(({ icon, text }) => (
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
}

export default ConnectionInstructions
