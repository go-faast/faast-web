import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'

import routes from 'Routes'
import SwapStatus from 'Components/SwapStatus'
import Expandable from 'Components/Expandable'

export default compose(
  setDisplayName('SwapList'),
  setPropTypes({
    swaps: PropTypes.arrayOf(PropTypes.object),
    header: PropTypes.string,
  }),
  defaultProps({
    swaps: [],
    header: 'Orders',
  }),
)(({ swaps, header, ...props }) => (
  <Card {...props}>
    <CardHeader>
      <h5>{header}</h5>
    </CardHeader>
    {!swaps ? (
      <CardBody>
        <i>No {header.toLowerCase()}</i>
      </CardBody>
    ) : (
      <ListGroup>
        {swaps.map((swap) => (
          <ListGroupItem action className='pb-1' key={swap.id} tag={Link} to={routes.tradeDetail(swap.orderId)}>
            <SwapStatus swap={swap} hideChange/>
            <div className='text-right mt-1'>
              <small className='text-muted'>
                <Expandable
                  shrunk={swap.createdAtFriendly}
                  expanded={swap.createdAtFormatted}
                />
              </small>
            </div>
          </ListGroupItem>
        ))}
        <ListGroupItem action tag={Link} to={routes.tradeHistory()} className='text-center text-primary mt-auto'>
          View all orders
        </ListGroupItem>
      </ListGroup>
    )}
  </Card>
))
