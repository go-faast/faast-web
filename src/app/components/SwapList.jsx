import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Card, CardHeader, CardBody, CardFooter, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'

import routes from 'Routes'
import Pair from 'Components/Pair'

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
          <ListGroupItem action key={swap.id} tag={Link} to={routes.tradeDetail(swap.orderId)}>
            <div>
              <Pair from={swap.sendSymbol} to={swap.receiveSymbol}/>
            </div>
            <small className='text-muted'>{swap.createdAtFriendly}</small>
          </ListGroupItem>
        ))}
      </ListGroup>
    )}
    <CardFooter className='text-center mt-auto'>
      <Link to={routes.tradeHistory()}>
        View all orders
      </Link>
    </CardFooter>
  </Card>
))
