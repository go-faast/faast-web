import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import { Row, Col, Card } from 'reactstrap'

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
      icon: 'fa-external-link-square',
      text: (<span>When the popop asks if you want to export the public key, select <b>Export</b></span>)
    },
    {
      icon: 'fa-unlock',
      text: 'If required, enter your pin or password to unlock the TREZOR'
    }
  ]
}

const ConnectionInstructions = ({ type }) => (
  <Row className='gutter-2 text-muted'>
    {instructions[type].map(({ icon, text }, i) => (
      <Col key={i} xs='12' md={(i === instructions[type].length - 1) ? true : '6'}>
        <Card body className='h-100 flex-col-center flat'>
          <i className={classNames('mb-2 fa fa-2x', icon)} />
          <div>{text}</div>
        </Card>
      </Col>
    ))}
  </Row>
)

ConnectionInstructions.propTypes = {
  type: PropTypes.oneOf(Object.keys(instructions)).isRequired,
}

export default ConnectionInstructions