import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { toBigNumber } from 'Utilities/convert'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Table } from 'reactstrap'
import { getHoldingsByAsset, getCurrentChildWalletsForSymbol } from 'Selectors/wallet'
import { getSentSwapsByAsset } from 'Selectors/swap'
import { getAsset } from 'Selectors/asset'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'
import Expandable from 'Components/Expandable'
import { removeWallet } from 'Actions/wallet'

import RemoveWallet from 'Img/removeWallet.png'

const WalletRow = ({ wallet, symbol, push, removeWallet }) => {
  return (
    <tr>
      <td>{wallet.label}</td>
      <td><Units value={wallet.balances[symbol]} symbol={symbol} /></td>
      <td>
        <Button 
          onClick={() => push(`${symbol}/send/${wallet.id}`)}
          size='sm' 
          color='ultra-dark' 
          className='mr-2 flat'
        >
            Send
        </Button>
        <Button 
          onClick={() => push(`${symbol}/receive/${wallet.id}`)}
          size='sm' 
          color='ultra-dark' 
          className='flat'
        >
          Receive
        </Button>
      </td>
      <td>
        <Expandable 
          onClick={() => removeWallet(wallet.id)}
          shrunk={<img className='cursor-pointer' src={RemoveWallet} height='20' width='20' />} 
          expanded='Remove Wallet' 
        />
      </td>
    </tr>
  )
}

const WalletTable = ({ wallets, symbol, push, removeWallet }) => {
  return (
    <Table hover striped responsive className='text-left'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Balance</th>
          <th></th>
          <th></th>
        </tr>
        {wallets.map(wallet => {
          return (
            <WalletRow key={wallet.id} wallet={wallet} symbol={symbol} push={push} removeWallet={removeWallet} />
          )
        })}
      </thead>
    </Table>
  )
}

const TransactionRow = ({ transaction }) => {
  return (
    <tr>
      <td>Swap</td>
      <td>
        <CoinIcon style={{ top: -1 }} className='mr-1 position-relative' symbol={transaction.sendSymbol} size='sm' />
        <Units className='mr-1' value={transaction.sendAmount} precision={6} symbol={transaction.sendSymbol} showSymbol/>
        <span> to </span> 
        <CoinIcon style={{ top: -1 }} className='mx-1 position-relative' symbol={transaction.receiveSymbol} size='sm' />
        <Units value={transaction.receiveAmount} precision={6} symbol={transaction.receiveSymbol} showSymbol/>
      </td>
      <td>
        {transaction.tx.hash ? (
          transaction.tx.hash
        ) : 
          '-'}
      </td>
      <td>{transaction.createdAtFormatted}</td>
    </tr>
  )
}

const TransactionTable = ({ transactions, symbol }) => {
  return (
    <Table hover striped responsive className='text-left'>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Transaction ID</th>
          <th>Date</th>
        </tr>
        {transactions.map(transaction => {
          return (
            <TransactionRow key={transaction.id} transaction={transaction} symbol={symbol} />
          )
        })}
      </thead>
    </Table>
  )
}

const WalletDetail = ({ symbol, holdings, connectedWallets, sentSwaps, push, asset, removeWallet }) => {
  return (
    <div className='text-center'>
      <Row className='mb-4'>
        <Col xs='12'>
          <div className='mt-2'>
            <CoinIcon symbol={symbol} size='lg' />  
          </div>
          <h1 className='mt-3 font-weight-bold'> 
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
          <TransactionTable transactions={sentSwaps} />
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
    asset: (state, { symbol }) => getAsset(state, symbol)
  }), {
    push,
    removeWallet
  }),
)(WalletDetail)