import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, Collapse, Row, Col } from 'reactstrap'
import classNames from 'class-names'
import { defaultPortfolioId, setCurrentPortfolio, setCurrentWallet, createNewPortfolio, removePortfolio } from 'Actions/portfolio'
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

  render() {
    const {
      portfolioWalletIds, currentPortfolioId, currentWalletId,
      createNewPortfolio, removePortfolio, setCurrentPortfolio, setCurrentWallet,
    } = this.props
    
    return (
      <div>
        <h5>Portfolios</h5>
        <Row className='medium-gutters-y'>
          {Object.entries(portfolioWalletIds).map(([portfolioId, walletIds]) => {
            const showWallets = this.state.expandedPortfolios[portfolioId]
            return (
              <Col key={portfolioId} xs='12'>
                <ListGroup>
                  <ListItem id={portfolioId}
                    active={currentWalletId === portfolioId}
                    onClick={() => setCurrentPortfolio(portfolioId)}/>
                  <ListGroupItem className='grid-group'>
                    <Row className='medium-gutters'>
                      <Col xs='4'>
                        <button className='grid-cell text-red' 
                          disabled={portfolioId === defaultPortfolioId}
                          onClick={() => removePortfolio(portfolioId)}>
                          <i className='fa fa-trash'/> delete
                        </button>
                      </Col>
                      <Col xs='4'>
                        <Link className='grid-cell' to='/connect'>
                          <i className='fa fa-plus'/> add wallet
                        </Link>
                      </Col>
                      <Col xs='4'>
                        <button className='grid-cell' onClick={() => this.togglePortfolio(portfolioId)}>
                          {showWallets
                            ? (<span><i className='fa fa-caret-up'/> hide wallets</span>)
                            : (<span><i className='fa fa-caret-down'/> show wallets</span>)}
                        </button>
                      </Col>
                    </Row>
                  </ListGroupItem>
                  <Collapse isOpen={showWallets}>
                    {walletIds.length > 0
                      ? walletIds.map((id) => (
                          <ListItem key={id} id={id} nested
                            active={currentPortfolioId === portfolioId && currentWalletId === id}
                            onClick={() => setCurrentWallet(portfolioId, id)}/>
                        ))
                      : (<ListGroupItem><i>No wallets in this portfolio</i></ListGroupItem>)}
                  </Collapse>
                </ListGroup>
              </Col>
            )
          })}
          <Col xs='12'>            
            <Button small onClick={() => createNewPortfolio(true)}>+ add portfolio</Button>
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
  setCurrentWallet,
  setCurrentPortfolio,
  createNewPortfolio,
  removePortfolio,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)