import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { compose } from 'recompose'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardBody, Col, Row, Dropdown, DropdownMenu, DropdownToggle,
  DropdownItem, Button
} from 'reactstrap'
import classNames from 'class-names'
import { connect } from 'react-redux'

import display from 'Utilities/display'
import { getWalletWithHoldings, } from 'Selectors'
import { getConnectedWalletsPendingSwaps } from 'Selectors/swap'
import { areCurrentPortfolioBalancesUpdating } from 'Selectors/portfolio'
import { updateAllHoldings } from 'Actions/portfolio'
import { removeAllWallets } from 'Actions/wallet'

import withToggle from 'Hoc/withToggle'

import TradeTable from 'Components/TradeTable'
import { tableHeadingsOpen } from 'Components/TradeHistory'
import ChangePercent from 'Components/ChangePercent'
import Address from 'Components/Address'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import PieChart from 'Components/PieChart'
import AssetTable from 'Components/AssetTable'
import ShareButton from 'Components/ShareButton'
import T from 'Components/i18n/T'

import { statLabel } from './style'
import Expandable from '../Expandable'

const Balances = ({ wallet, handleRemove, removeAllWallets, isDropdownOpen, toggleDropdownOpen, 
  handleAdd, isAlreadyInPortfolio, showStats, pendingSwaps, updateAllHoldings, areBalancesUpdating }) => {
  const {
    address, assetHoldings, holdingsLoaded, holdingsError, label, totalFiat, 
    totalFiat24hAgo, totalChange, id
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
      {address && (
        <Col style={{ top: '-1px' }} className='p-0 position-relative' xs='auto'>
          <ShareButton wallet={wallet}/>
        </Col>
      )}
      <Col className='p-0 pr-2' xs='auto'>
        <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
          <DropdownToggle 
            tag='div'
            className='py-0 px-2 flat d-inline-block position-relative cursor-pointer' 
          >
            <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
          </DropdownToggle>
          <DropdownMenu className='p-0' right>
            {isAlreadyInPortfolio && id !== 'default' ? (
              <DropdownItem className='py-2' onClick={handleRemove}>
                <T tag='span' i18nKey='app.dashboard.removeWallet'>Remove Wallet</T>
              </DropdownItem>
            ) : id === 'default' ? (
              <DropdownItem className='py-2' onClick={removeAllWallets}>
                <span>Remove all wallets</span>
              </DropdownItem>
            ) : (
              <DropdownItem className='py-2' onClick={handleAdd}>
                <T tag='span' i18nKey='app.dashboard.addWallet'>Add Wallet</T>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </Col>
    </Fragment>)
  )

  return (
    <Fragment>
      {!holdingsLoaded && (
        <LoadingFullscreen 
          label={<T tag='span' i18nKey='app.loading.balances'>Loading balances...</T>}  
          error={holdingsError}
          errorButton={(
            <Button 
              onClick={updateAllHoldings} 
              className='mt-2' 
              size='sm' 
              color='primary'
              disabled={areBalancesUpdating}
            >
              {!areBalancesUpdating ? 'Retry Balances' : 'Retrying...'}
            </Button>
          )}
        />
      )}
      <Card>
        <CardHeader className={showStats ? 'grid-group' : null}>
          {!showStats && (
            <Col className='px-0' xs='12'>
              <Row className='gutter-3 align-items-center'>
                <Col className='px-2'>
                  <h5>{id !== 'default' ? (
                    <T tag='span' i18nKey='app.dashboard.walletHoldings'>{label} Holdings</T>
                  ) : (<T tag='span' i18nKey='app.dashboard.portfolioHoldings'>Portfolio Holdings</T>)}
                  </h5>
                </Col>
                <Expandable 
                  shrunk={(
                    <Button className={`${id !== 'default' && 'pr-1'}`} onClick={updateAllHoldings} color='transparent'>
                      <i className={`fa fa-refresh cursor-pointer ${areBalancesUpdating ? 'fa-spin' : ''}`} />
                    </Button>
                  )} 
                  expanded={areBalancesUpdating ? 'Refreshing holdings' : 'Refresh holdings'}
                />
                {searchAndShare}
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
      {pendingSwaps && (
        <TradeTable 
          tableTitle={<T tag='span' i18nKey='app.orders.openOrderTitle'>Open Orders</T>}
          swaps={pendingSwaps}
          tableHeadings={tableHeadingsOpen}
          hideIfNone
          classProps='mt-3'
        />
      )}
      {assetRows.length > 0 && (<Card className='mt-3'>
        <CardHeader>
          <T tag='h5' i18nKey='app.dashboard.distribution'>Distribution</T>
        </CardHeader>
        <CardBody>
          {address && (
            <div className='text-right' style={{ lineHeight: 1 }}>
              <Address address={address} />
              <T tag='small' i18nKey='app.dashboard.address' className='text-muted'>address</T>
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

const mapStateToProps = connect(createStructuredSelector({
  pendingSwaps: getConnectedWalletsPendingSwaps,
  areBalancesUpdating: areCurrentPortfolioBalancesUpdating
}), {
  updateAllHoldings: updateAllHoldings,
  removeAllWallets,
})


export { Balances, ConnectedBalances }
export default compose(withToggle('dropdownOpen'), mapStateToProps)(Balances)
