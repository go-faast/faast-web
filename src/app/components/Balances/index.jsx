import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardBody, Col, Row, Dropdown, DropdownMenu, DropdownToggle,
  DropdownItem
} from 'reactstrap'
import classNames from 'class-names'
import { connect } from 'react-redux'

import display from 'Utilities/display'
import { getWalletWithHoldings } from 'Selectors'

import withToggle from 'Hoc/withToggle'

import ChangePercent from 'Components/ChangePercent'
import Address from 'Components/Address'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import PieChart from 'Components/PieChart'
import AssetTable from 'Components/AssetTable'
import ShareButton from 'Components/ShareButton'

import { statLabel } from './style'

const Balances = ({ wallet, handleRemove, isDropdownOpen, toggleDropdownOpen, 
  handleAdd, isAlreadyInPortfolio, showStats }) => {
  const {
    address, assetHoldings, holdingsLoaded, holdingsError, label, totalFiat, 
    totalFiat24hAgo, totalChange
  } = wallet

  const assetRows = assetHoldings.filter(({ shown }) => shown)

  const stats = [
    {
      title: 'total assets',
      value: assetRows.length,
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

  const searchAndShare = (
    (<Fragment>
      <Col style={{ top: '2px' }} className='p-0 position-relative' xs='auto'>
        <ShareButton wallet={wallet}/>
      </Col>
      <Col className='p-0 pr-2' xs='auto'>
        <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
          <DropdownToggle 
            tag='div'
            className='py-0 px-2 flat d-inline-block position-relative cursor-pointer' 
          >
            <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
          </DropdownToggle>
          <DropdownMenu className='p-0' right>
            {isAlreadyInPortfolio ? (
              <DropdownItem className='py-2' onClick={handleRemove}>Remove Wallet</DropdownItem>
            ) : (
              <DropdownItem className='py-2' onClick={handleAdd}>Add Wallet</DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </Col>
    </Fragment>)
  )

  return (
    <Fragment>
      {!holdingsLoaded && (
        <LoadingFullscreen label='Loading balances...' error={holdingsError}/>
      )}
      <Card>
        <CardHeader className={showStats ? 'grid-group' : null}>
          {!showStats && (
            <Col className='px-0' xs='12'>
              <Row className='gutter-3 align-items-center'>
                <Col className='px-2'>
                  <h5>{address ? label : 'Portfolio'} Holdings</h5>
                </Col>
                {address ?
                  searchAndShare
                  : null}
              </Row>
            </Col>
          )}
          {showStats && (
            <Row className='gutter-3'>
              {stats.map(({ title, value, colClass }, i) => (
                <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
                  <div className='grid-cell'>
                    <div className='h3 mb-0'>{value}</div>
                    <small className={classNames('mb-0', statLabel)}>{title}</small>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </CardHeader>
        <AssetTable assetRows={assetRows}/>
      </Card>
      {assetRows.length > 0 && (<Card className='mt-3'>
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
      </Card>)}
    </Fragment>
  )
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired,
  handleRemove: PropTypes.func,
  handleAdd: PropTypes.func,
  isAlreadyInPortfolio: PropTypes.bool,
  showStats: PropTypes.bool
}

Balances.defaultProps = {
  isAlreadyInPortfolio: true,
  showStats: false
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
