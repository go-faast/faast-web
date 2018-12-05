import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardBody, Col, Row, Button, Dropdown, DropdownMenu, DropdownToggle,
  DropdownItem
} from 'reactstrap'
import { connect } from 'react-redux'

import withToggle from 'Hoc/withToggle'

import { getWalletWithHoldings } from 'Selectors'
import Address from 'Components/Address'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import PieChart from 'Components/PieChart'
import AssetTable from 'Components/AssetTable'
import ShareButton from 'Components/ShareButton'

const Balances = ({ wallet, handleRemove, isDropdownOpen, toggleDropdownOpen }) => {
  const {
    address, assetHoldings, holdingsLoaded, holdingsError, label
  } = wallet

  const assetRows = assetHoldings.filter(({ shown }) => shown)

  return (
    <Fragment>
      {!holdingsLoaded && (
        <LoadingFullscreen label='Loading balances...' error={holdingsError}/>
      )}
      <Card>
        <CardHeader>
          <Col className='px-0' xs='12'>
            <Row className='gutter-3 align-items-center'>
              <Col className='px-2'>
                <h5>{address ? label : 'Portfolio'} Holdings</h5>
              </Col>
              {address ?
                (<Fragment>
                  <Col style={{ top: '2px' }} className='p-0 position-relative' xs='auto'>
                    <ShareButton wallet={wallet}/>
                  </Col>
                  <Col className='p-0' xs='auto'>
                    <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
                      <DropdownToggle 
                        tag='div'
                        className='py-0 px-2 flat d-inline-block position-relative cursor-pointer' 
                      >
                        <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem onClick={handleRemove}>Remove Wallet</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                </Fragment>)
                : null}
            </Row>
          </Col>
        </CardHeader>
        <AssetTable assetRows={assetRows}/>
      </Card>
      <Card className='mt-3'>
        <CardHeader>
          <h5>Distribution</h5>
        </CardHeader>
        <CardBody>
          {address && (
            <div className='text-right' style={{ lineHeight: 1 }}>
              <Address address={address} />
              <small className='text-muted'>address</small>
            </div>
          )}
          <PieChart portfolio={wallet} />
        </CardBody>
      </Card>
    </Fragment>
  )
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired,
  removeButton: PropTypes.node
}

const ConnectedBalances = connect(createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
}))(Balances)

ConnectedBalances.propTypes = {
  id: PropTypes.string.isRequired,
}

Balances.Connected = ConnectedBalances


export { Balances, ConnectedBalances }
export default withToggle('dropdownOpen')(Balances)
