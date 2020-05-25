import React, { Fragment } from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Table } from 'reactstrap'
import { getAllAssetsArray } from 'Common/selectors/asset'
import { getHoldingsByAsset, getCurrentChildWalletsForSymbol } from 'Selectors/wallet'
import { getSentSwapsByAsset } from 'Selectors/swap'
import Layout from 'Components/Layout'
import Units from 'Components/Units'
import CoinIcon from 'Components/CoinIcon'

const WalletRow = ({ wallet, symbol }) => {
  return (
    <tr>
      <td>{wallet.label}</td>
      <td><Units value={wallet.balances[symbol]} symbol={symbol} /></td>
      <td>
        <Button size='sm' color='ultra-dark' className='mr-2 flat'>Send</Button>
        <Button size='sm' color='ultra-dark' className='flat'>Receive</Button>
      </td>
      <td>remove</td>
    </tr>
  )
}

const WalletTable = ({ wallets, symbol }) => {
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
            <WalletRow key={wallet.id} wallet={wallet} symbol={symbol} />
          )
        })}
      </thead>
    </Table>
  )
}

const TransactionRow = ({ transaction, symbol }) => {
  return (
    <tr>
      <td>Swap</td>
      <td>
        <Units value={transaction.sendAmount} precision={6} symbol={transaction.sendSymbol} showSymbol/>
        <span> to </span> 
        <Units value={transaction.receiveAmount} precision={6} symbol={transaction.receiveSymbol} showSymbol/>
      </td>
      <td>
        {transaction.tx.hash && transaction.tx.hash}
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

const WalletDetail = ({ symbol, holdings, connectedWallets, sentSwaps }) => {
  return (
    <div className='text-center'>
      <Row>
        <Col xs='12'>
          <div>
            <CoinIcon symbol={symbol} size='lg' />  
          </div>
          <h2 className='mt-3'> 
            <Units value={holdings} symbol={symbol} />
          </h2>
        </Col>
      </Row>
      <Row className='text-left'>
        <Col xs='12'>
          <h2>Connected Wallets</h2>
          <WalletTable wallets={connectedWallets} symbol={symbol} />
        </Col>
        <Col>
          <h2>{symbol} Transactions</h2>
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
    sentSwaps: (state, { symbol }) => getSentSwapsByAsset(state, symbol)
  }), {
  }),
)(WalletDetail)