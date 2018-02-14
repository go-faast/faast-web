import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, Collapse, Row, Col } from 'reactstrap'
import classNames from 'class-names'
import { setCurrentPortfolio, setCurrentWallet, createNewPortfolio, removePortfolio } from 'Actions/portfolio'
import { getAllPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'
import Button from 'Components/Button'

const ListItem = ({ id, active, nested, onClick }) => (
  <ListGroupItem action active={active} onClick={onClick} tag='button' className={classNames({ 'compact pl-5': nested })}>
    <WalletSummary id={id} icon={nested} labelTag={nested ? 'span' : 'h6'}/>
  </ListGroupItem>
)

class WalletSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedPortfolios: {}
    }
    this.togglePortfolio = this.togglePortfolio.bind(this)
    this.switchWallet = this.switchWallet.bind(this)
  }

  togglePortfolio(id) {
    const { expandedPortfolios } = this.state
    const isExpanded = expandedPortfolios[id]
    const { currentPortfolioId, currentWalletId } = this.props
    if (currentPortfolioId === id && currentWalletId !== id) {
      this.switchWallet(id)
    }
    this.setState({
      expandedPortfolios: {
        ...expandedPortfolios,
        [id]: !isExpanded
      }
    })
  }

  switchWallet(portfolioId, walletId) {
    this.props.changePortfolio(portfolioId)
    this.props.changeWallet(walletId || portfolioId)
  }

  render() {
    const { portfolioWalletIds, createPortfolio, currentPortfolioId, currentWalletId, removePortfolio } = this.props
    
    return (
      <div>
        <h5>Portfolios</h5>
        <Row className='medium-gutters-y'>
          {Object.entries(portfolioWalletIds).map(([portfolioId, walletIds]) => {
            const showWallets = this.state.expandedPortfolios[portfolioId]
            return (
              <Col key={portfolioId} xs='12'>
                <ListGroup>
                  <ListItem id={portfolioId} active={currentWalletId === portfolioId} onClick={() => this.switchWallet(portfolioId)}/>
                  <ListGroupItem className='grid-actions compact'>
                    <Row>
                      <Col xs='4' tag='button' onClick={() => removePortfolio(portfolioId)} className='grid-action text-red'>
                        <i className='fa fa-trash'/> delete
                      </Col>
                      <Col xs='4' tag={Link} to='/connect' className='grid-action'>
                        <i className='fa fa-plus'/> add wallet
                      </Col>
                      <Col xs='4' tag='button' onClick={() => this.togglePortfolio(portfolioId)} className='grid-action'>
                        {showWallets ? 'hide' : 'show'} wallets
                      </Col>
                    </Row>
                  </ListGroupItem>
                  <Collapse isOpen={showWallets}>
                    {walletIds.length > 0
                      ? walletIds.map((id) => (<ListItem key={id} id={id} nested active={currentPortfolioId === portfolioId && currentWalletId === id} onClick={() => this.switchWallet(portfolioId, id)}/>))
                      : (<ListGroupItem><i>No wallets in this portfolio</i></ListGroupItem>)}
                  </Collapse>
                </ListGroup>
              </Col>
            )
          })}
          <Col xs='12'>            
            <Button small onClick={() => createPortfolio(true)}>+ add portfolio</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  portfolioWalletIds: getAllPortfolioWalletIds,
  currentPortfolioId: getCurrentPortfolioId,
  currentWalletId: getCurrentWalletId,
})

const mapDispatchToProps = {
  changeWallet: setCurrentWallet,
  changePortfolio: setCurrentPortfolio,
  createPortfolio: createNewPortfolio,
  removePortfolio: removePortfolio,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)