import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import display from 'Utilities/display'
import ChangePercent from 'Components/ChangePercent'

export default compose(
  setDisplayName('WalletStats'),
  setPropTypes({
    wallet: PropTypes.object.isRequired,
    tag: tagPropType,
  }),
)(({ tag: Tag, wallet }) => {
  const {
    totalFiat, totalFiat24hAgo, totalChange, shownAssetHoldings,
  } = wallet
  const stats = [
    {
      title: 'total assets',
      value: shownAssetHoldings.length,
      colClass: 'order-2 order-lg-1'
    },
    {
      title: 'total balance',
      value: display.fiat(totalFiat),
      colClass: 'order-1 order-lg-2'
    },
    {
      title: 'balance 24h ago',
      value: display.fiat(totalFiat24hAgo),
      colClass: 'order-3'
    },
    {
      title: 'since 24h ago',
      value: (<ChangePercent>{totalChange}</ChangePercent>),
      colClass: 'order-4'
    },
  ]
  return (
    <Tag className='grid-group'>
      <Row className='gutter-3'>
        {stats.map(({ title, value, colClass }, i) => (
          <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
            <div className='grid-cell'>
              <div className='h3 mb-0'>{value}</div>
              <small className='mb-0 text-muted text-uppercase letter-spacing'>{title}</small>
            </div>
          </Col>
        ))}
      </Row>
    </Tag>
  )
})
