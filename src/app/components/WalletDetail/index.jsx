import React, { Fragment } from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import { toBigNumber } from 'Utilities/convert'
import { formatDate } from 'Utilities/display'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Table } from 'reactstrap'
import { getHoldingsByAsset, getCurrentChildWalletsForSymbol } from 'Selectors/wallet'
import { getSentSwapsByAsset } from 'Selectors/swap'
import { getAsset } from 'Selectors/asset'
import { getSentWithdrawalsByAsset } from 'Selectors/withdrawal'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'
import Expandable from 'Components/Expandable'
import { removeWallet } from 'Actions/wallet'
import { ellipsize } from 'Utilities/display'
import config from 'Config'
import SwapIcon from 'Img/swap-icon.svg?inline'
import WithdrawalArrow from 'Img/withdrawalArrow.png'

import RemoveWallet from 'Img/removeWallet.png'

const WalletRow = ({ wallet, symbol, push, removeWallet }) => {
  const balance = wallet.balances[symbol]
  return (
    <tr>
      <td>{wallet.label}</td>
      <td><Units value={balance} symbol={symbol} /></td>
      <td>
        <Button 
          onClick={() => push(`/wallets/${symbol}/send/${wallet.id}`)}
          size='sm' 
          color='ultra-dark' 
          className='mr-2 flat'
          disabled={!balance || !balance.gt(0)}
        >
            Send
        </Button>
        <Button 
          onClick={() => push(`/wallets/${symbol}/receive/${wallet.id}`)}
          size='sm' 
          color='ultra-dark' 
          className='flat mt-xs-0 mt-2'
        >
          Receive
        </Button>
      </td>
      <td>
        <Expandable 
          onClick={() => removeWallet(wallet.id)}
          shrunk={<img className='cursor-pointer' src={RemoveWallet} height='20' width='20' />} 
          className='position-relative'
          style={{ top: 2 }}
          expanded='Remove Wallet' 
        />
      </td>
    </tr>
  )
}

const WalletTable = ({ wallets, symbol, push, removeWallet }) => {
  return wallets.length > 0 ? (
    <Table responsive className='text-left'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Balance</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {wallets.map(wallet => {
          return (
            <WalletRow key={wallet.id} wallet={wallet} symbol={symbol} push={push} removeWallet={removeWallet} />
          )
        })}
      </tbody>
    </Table>
  ) : (
    <p className='my-3'>
      <i>No {symbol} wallets connected yet.</i>
    </p>
  )
}

const TransactionRow = ({ transaction: { data: transaction, type }, asset }) => {
  const explorerURL = type === 'swap' ? config.explorerUrls[transaction.sendSymbol] || config.explorerUrls[transaction.sendAsset.ERC20 ? 'ETH' : ''] : config.explorerUrls[transaction.assetSymbol] || config.explorerUrls[asset.ERC20 ? 'ETH' : '']
  return (
    <tr>
      <td>{type === 'swap' ? (
        <Expandable shrunk={<SwapIcon fill='#ddd' width='14' />} expanded='Swap' />) : (
        <Expandable shrunk={<img src={WithdrawalArrow} width='19' />} expanded='Sent' />
      )}</td>
      {type === 'swap' ? (
        <td>
          <CoinIcon style={{ top: -1 }} className='mr-1 position-relative' symbol={transaction.sendSymbol} size='sm' />
          <Units className='mr-1' value={transaction.sendAmount} precision={6} symbol={transaction.sendSymbol} showSymbol/>
          <span> to </span> 
          <CoinIcon style={{ top: -1 }} className='mx-1 position-relative' symbol={transaction.receiveSymbol} size='sm' />
          <Units value={transaction.receiveAmount} precision={6} symbol={transaction.receiveSymbol} showSymbol/>
        </td>
      ) : (
        <td>
          <CoinIcon style={{ top: -1 }} className='mr-1 position-relative' symbol={transaction.assetSymbol} size='sm' />
          <Units value={transaction.amount} precision={6} symbol={transaction.assetSymbol} showSymbol/> to {ellipsize(transaction.to, 8, 8)}
        </td>
      )}
      {type === 'swap' ? (
        <td>
          {transaction.txId && explorerURL ? (
            <Fragment>
              <a href={`${explorerURL}/tx/${transaction.txId}`} target='_blank' rel='noopener noreferrer' className='word-break-all font-sm'>{ellipsize(transaction.txId, 20)}</a>
            </Fragment>
          ) : 
            '-'
          }
        </td>
      ) : (
        <td>
          {transaction.hash && explorerURL ? (
            <Fragment>
              <a href={`${explorerURL}/tx/${transaction.hash}`} target='_blank' rel='noopener noreferrer' className='word-break-all font-sm'>{ellipsize(transaction.hash, 20)}</a>
            </Fragment>
          ) : 
            '-'
          }
        </td>
      )}
      <td>{type === 'swap' ? 
        transaction.createdAtFormatted : 
        formatDate(transaction.sentAt, 'yyyy-MM-dd hh:mm:ss')}
      </td>
    </tr>
  )
}

const TransactionTable = ({ transactions, symbol, asset }) => {
  return transactions.length > 0 ? (
    <Table striped={false} responsive className='text-left'>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Transaction ID</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(transaction => {
          return (
            <TransactionRow key={transaction.data.id} transaction={transaction} symbol={symbol} asset={asset} />
          )
        })}
      </tbody>
    </Table>
  ) : (
    <p className='my-3'>
      <i>No {symbol} transactions completed yet.</i>
    </p>
  )
}

const WalletDetail = ({ symbol, holdings, connectedWallets, transactions, push, asset, 
  showMobileSearch, removeWallet }) => {
  return (
    <div className='text-center'>
      <Button
        color='ultra-dark' 
        onClick={() => showMobileSearch(true)}
        size='small'
        className='d-lg-none d-inline-block'
      >
        Search wallets by asset <i className='fa fa-caret-down' />
      </Button>
      <Row className='mb-4'>
        <Col xs='12'>
          <div className='mt-3'>
            <CoinIcon symbol={symbol} size='lg' />  
          </div>
          <h1 style={{ fontSize: 46 }} className='mt-3 font-weight-bold'> 
            <Units value={toBigNumber(holdings).times(asset.price)} precision={6} currency prefixSymbol symbolSpaced={false} />
          </h1>
          <h4 className='text-muted mb-0'>
            (<Units value={holdings} symbol={symbol} />)
          </h4>
        </Col>
      </Row>
      <Row className='text-left'>
        <Col className='mb-3' xs='12'>
          <h3 style={{ fontWeight: 600 }} className='mb-3'>Connected Wallets</h3>
          <WalletTable wallets={connectedWallets} symbol={symbol} push={push} removeWallet={removeWallet} />
        </Col>
        <Col>
          <h3 style={{ fontWeight: 600 }} className='mb-3'>{symbol} Transactions</h3>
          <TransactionTable transactions={transactions} asset={asset} />
        </Col>
      </Row>
    </div>
  )
}

export default compose(
  setDisplayName('WalletDetail'),
  connect(createStructuredSelector({
    holdings: (state, { symbol }) => getHoldingsByAsset(state, symbol),
    connectedWallets: (state, { symbol }) => getCurrentChildWalletsForSymbol(state, symbol),
    sentSwaps: (state, { symbol }) => getSentSwapsByAsset(state, symbol),
    asset: (state, { symbol }) => getAsset(state, symbol),
    withdrawals: (state, { symbol }) => getSentWithdrawalsByAsset(state, symbol)
  }), {
    push,
    removeWallet
  }),
  withProps(({ sentSwaps, withdrawals }) => {
    let transactions = []
    sentSwaps.forEach(swap => {
      const o = {
        type: 'swap',
        data: swap
      }
      transactions.push(o)
    })
    withdrawals.forEach(tx => {
      const o = {
        type: 'tx',
        data: tx
      }
      transactions.push(o)
    })
    transactions = transactions.sort((a,b) => { 
      const c = a.data.updatedAt || a.data.sentAt
      const d = b.data.updatedAt || b.data.sentAt
      return d - c
    })
    return ({
      transactions
    })
  })
)(WalletDetail)