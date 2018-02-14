import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardHeader, ListGroup, ListGroupItem } from 'reactstrap'
import classNames from 'class-names'
import { setCurrentWallet } from 'Actions/portfolio'
import { getCurrentPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'

const WalletSelector = ({ currentPortfolioId, walletIds, currentWalletId, changeWallet }) => {
  const ListItem = ({ id, nested }) => (
    <ListGroupItem active={id === currentWalletId} onClick={() => changeWallet(id)} tag='button' action className={classNames({ 'compact': nested })}>
      <WalletSummary id={id} icon={nested} labelTag={nested ? 'span' : 'h6'}/>
    </ListGroupItem>
  )
  return (
    <Card>
      <CardHeader><h5>Portfolio</h5></CardHeader>
      <ListGroup>
        <ListItem id={currentPortfolioId}/>
        {walletIds.length > 0
          ? walletIds.map((id) => (<ListItem key={id} id={id} nested/>))
          : (<ListGroupItem><i>No wallets in this portfolio</i></ListGroupItem>)}
        <ListGroupItem tag={Link} to='/connect' action><h6>+ add wallet</h6></ListGroupItem>
      </ListGroup>
    </Card>
  )
}

const mapStateToProps = createStructuredSelector({
  walletIds: getCurrentPortfolioWalletIds,
  currentPortfolioId: getCurrentPortfolioId,
  currentWalletId: getCurrentWalletId,
})

const mapDispatchToProps = {
  changeWallet: setCurrentWallet,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)