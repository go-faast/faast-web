import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { toBigNumber } from 'Utilities/numbers'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps, withState } from 'recompose'
import { Row, Col, Table, Card, CardHeader, CardBody, CardFooter, ButtonDropdown, Button,
  DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'
import withToggle from 'Hoc/withToggle'
import { capitalizeFirstLetter } from 'Utilities/helpers'

import { getMakerBalances } from 'Selectors/maker'

import { text, affilateTable, card, cardHeader, cardFooter, smallCard } from './style'

const BalanceTableRow = ({
  asset: { asset: symbol, exchange, wallet, walletUsd, exchangeUsd, hotwalletAddress, exchangeAddress },
  balanceType, size, ...props
}) => {
  const balanceValue = balanceType == 'total' ? toBigNumber(exchange).plus(toBigNumber(wallet)) :
    balanceType == 'wallet' ? toBigNumber(wallet) : toBigNumber(exchange)
  const fiatValue = balanceType == 'total' ? toBigNumber(exchangeUsd).plus(toBigNumber(walletUsd)) :
    balanceType == 'wallet' ? toBigNumber(walletUsd) : toBigNumber(exchangeUsd)
  const address = balanceType == 'exchange' ? exchangeAddress : balanceType == 'wallet' ? hotwalletAddress : ''
  return (
    <tr {...props}>
      <td>
        <span style={{ left: 8 }} className='position-relative'>
          <CoinIcon symbol={symbol} size='sm' />
          <span style={{ fontWeight: 500 }} className='ml-2'>{symbol}</span>
        </span>
      </td>
      <td>
        <Units value={balanceValue} symbol={symbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
      </td>
      <td>
        <Units value={fiatValue} symbol={'$'} precision={6} showSymbol showIcon currency symbolSpaced={false} iconProps={{ className: 'd-sm-none' }} prefixSymbol />
      </td>
      {size == 'small' ? null : balanceType != 'total' ? (
        <td className='text-right pr-4'>
          <Button tag={Link} color='white' style={{ border: '1px solid #ebeff1' }} size='sm' className='flat' to={`/makers/balances/${symbol}/${balanceType}/${address}`}>{capitalizeFirstLetter(balanceType)} Address</Button>
        </td>
      ) : (
        <td className='text-right pr-4'>
          <Button tag={Link} color='white' style={{ border: '1px solid #ebeff1' }} size='sm' className='flat mr-2' to={`/makers/balances/${symbol}/${'wallet'}/${hotwalletAddress}`}>Wallet Address</Button>
          <Button tag={Link} color='white' style={{ border: '1px solid #ebeff1' }} size='sm' className='flat' to={`/makers/balances/${symbol}/${'exchange'}/${exchangeAddress}`}>Exchange Address</Button>
        </td>
      )}
    </tr>
  )
}

const MakerBalanceTable = ({ balances, size, isDropdownOpen, toggleDropdownOpen, balanceType, updateBalanceType }) => {
  balances = size === 'small' ? balances.slice(0,7) : balances
  const label = balanceType == 'total' ? 'Total' : balanceType == 'wallet' ? 'Wallet' : 'Exchange'
  return (
    <Fragment>
      <Card className={classNames(card, size === 'small' && smallCard, size != 'small' && 'mx-auto')}>
        <CardHeader className={cardHeader}>
          <Row className='align-items-center'>
            <Col className='d-lg-flex d-none' xs='12' lg='10'>{label} Balances</Col>
            {size !== 'small' && (
              <Col xs='2' lg='2'>
                <ButtonDropdown addonType='append' isOpen={isDropdownOpen} toggle={toggleDropdownOpen}>
                  <DropdownToggle className='flat' size='sm' color={'white'} style={{ border: '1px solid #ebeff1' }} caret>
                    {label} Balances
                  </DropdownToggle>
                  <DropdownMenu className={classNames(card)} center>
                    <DropdownItem 
                      active={balanceType == 'total'} 
                      className={classNames(card, text, 'flat')}
                      onClick={() => updateBalanceType('total')}
                    >
                    Total Balances
                    </DropdownItem>
                    <hr className='w-100 my-2 border-light'/>
                    <DropdownItem 
                      active={balanceType == 'wallet'} 
                      className={classNames(card, text, 'flat')}
                      onClick={() => updateBalanceType('wallet')}
                    >
                    Wallet Balances
                    </DropdownItem>
                    <hr className='w-100 my-2 border-light'/>
                    <DropdownItem 
                      active={balanceType == 'exchange'} 
                      className={classNames(card, text, 'flat')}
                      onClick={() => updateBalanceType('exchange')}
                    >
                    Exchange Balances
                    </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
              </Col>
            )}
            
          </Row>
        </CardHeader>
        <CardBody className={classNames(balances.length > 0 && 'p-0', 'text-center')}>
          {balances.length > 0 ? (
            <Fragment>
              <Table className={classNames('text-left', text, affilateTable)} striped responsive>
                <thead>
                  <tr>
                    <th className='position-relative' style={{ left: 8 }}>Coin</th>
                    <th>Balance</th>
                    <th>Minimum Balance</th>
                    <th>Balance (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((asset, i) => {
                    return (
                      <BalanceTableRow key={i} size={size} balanceType={balanceType} asset={asset}/>
                    )
                  })}
                </tbody>
              </Table>
            </Fragment>
          ) :
            <div className='d-flex align-items-center justify-content-center'>
              <p className={classNames('mb-0', text)}>No Balances yet.</p>
            </div>
          }
        </CardBody>
        {size === 'small' && balances.length > 0 && (
          <CardFooter 
            tag={Link} 
            to='/makers/balances'
            className={classNames(cardFooter, text, balances.length <= 6 && 'position-absolute', 'p-2 text-center cursor-pointer d-block w-100')}
            style={{ bottom: 0 }}
          >
            <span className='font-weight-bold'>View All Balances</span>
          </CardFooter>)}
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerBalanceTable'),
  connect(createStructuredSelector({
    balances: getMakerBalances,
  }), {
  }),
  withState('balanceType', 'updateBalanceType', 'total'),
  withProps(({ balances, balanceType }) => {
    balances = balances || []
    balances = balanceType == 'total' ? 
      balances.sort((a,b) => (b.exchangeUsd + b.walletUsd) - (a.exchangeUsd + a.walletUsd)) :
      balanceType == 'wallet' ? balances.sort((a,b) => (b.walletUsd) - (a.walletUsd)) :
        balances.sort((a,b) => (b.exchangeUsd) - (a.exchangeUsd))
    return ({
      balances
    })
  }),
  setPropTypes({
    size: PropTypes.string
  }),
  defaultProps({
    size: 'large'
  }),
  withToggle('dropdownOpen'),
  withRouter,
)(MakerBalanceTable)
