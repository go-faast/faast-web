import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, Row, Col, Button, Card } from 'reactstrap'
import classNames from 'class-names'
import { setCurrentWallet } from 'Actions/portfolio'
import { getCurrentPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'
import ListGroupButton from 'Components/ListGroupButton'

const WalletListButton = ({ id, active, nested, onClick, className, ...props }) => (
  <ListGroupButton active={active} onClick={onClick} className={classNames({ 'compact': nested }, className)} {...props}>
    <WalletSummary.Connected id={id} icon={nested} />
  </ListGroupButton>
)

const WalletSelector = ({
  portfolioId, portfolioWalletIds, currentWalletId, setCurrentWallet
}) => (
  <Row className='gutter-3 align-items-end'>
    <Col>
      <h4 className='m-0 text-primary'>Wallets</h4>
    </Col>
    <Col xs='auto'>
      <Button tag={Link} color='success' outline size='sm' to='/connect'><i className='fa fa-plus'/> add wallet</Button>
    </Col>
    <Col xs='12'>
      <Card>
        <ListGroup>
          <WalletListButton id={portfolioId}
            active={currentWalletId === portfolioId}
            onClick={() => setCurrentWallet(portfolioId, portfolioId)}/>
          <ListGroupItem className='p-1'/>
          {portfolioWalletIds.length > 0
            ? portfolioWalletIds.map((walletId) => (
                <WalletListButton key={walletId} id={walletId} nested
                  active={currentWalletId === walletId}
                  onClick={() => setCurrentWallet(portfolioId, walletId)}/>
              ))
            : (<ListGroupItem><i className='text-muted'>No wallets in this portfolio</i></ListGroupItem>)}
        </ListGroup>
      </Card>
    </Col>
  </Row>
)

const mapStateToProps = createStructuredSelector({
  currentWalletId: getCurrentWalletId,
  portfolioId: getCurrentPortfolioId,
  portfolioWalletIds: getCurrentPortfolioWalletIds,
})

const mapDispatchToProps = {
  setCurrentWallet,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)