import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { setCurrentWallet } from 'Actions/portfolio'
import { getCurrentPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'

const WalletSelector = ({ currentPortfolioId, walletIds, currentWalletId, changeWallet }) => {
  const ListItem = ({ id, icon }) => (
    <ListGroupItem key={id} active={id === currentWalletId} onClick={() => changeWallet(id)} tag='button' action>
      <WalletSummary id={id} icon={icon}/>
    </ListGroupItem>
  )
  return (
    <div>
      <ListGroup>
        <ListItem id={currentPortfolioId}/>
        <ListGroupItem>
          <h5 className='my-0'>Wallets</h5>
        </ListGroupItem>
        {walletIds.length > 0
          ? walletIds.map((id) => ListItem({ id, icon: true }))
          : (<ListGroupItem><i>No wallets in this portfolio</i></ListGroupItem>)}
        <ListGroupItem tag={Link} to='/connect' action><h5 className='my-0 font-weight-normal'>+ add wallet</h5></ListGroupItem>
      </ListGroup>
    </div>
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