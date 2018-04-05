import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux';
import { ListGroup, ListGroupItem, Collapse, Row, Col, Button, Card } from 'reactstrap'
import classNames from 'class-names'
import { setCurrentPortfolio, setCurrentWallet, createNewPortfolio, removePortfolio } from 'Actions/portfolio'
import { getAllPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'
import ListGroupButton from 'Components/ListGroupButton'

const ListItem = ({ id, active, nested, onClick, className, ...props }) => (
  <ListGroupButton active={active} onClick={onClick} className={classNames({ 'compact': nested }, className)} {...props}>
    <WalletSummary.Connected id={id} icon={nested} />
  </ListGroupButton>
)

class WalletSelector extends React.Component {
  constructor(props) {
    super(props)
    const { currentPortfolioId, currentWalletId } = props
    this.state = {
      expandedPortfolios: {
        [currentPortfolioId]: currentWalletId !== currentPortfolioId
      }
    }
    this.setPortfolioExpanded = this.setPortfolioExpanded.bind(this)
    this.togglePortfolio = this.togglePortfolio.bind(this)
    this.connectWalletToPortfolio = this.connectWalletToPortfolio.bind(this)
  }

  setPortfolioExpanded(portfolioId, expanded) {
    const { expandedPortfolios } = this.state
    const currentlyExpanded = Boolean(expandedPortfolios[portfolioId]) // Coerce undefined
    if (expanded !== currentlyExpanded) {
      const { currentPortfolioId, currentWalletId, setCurrentPortfolio } = this.props
      if (!expanded && currentPortfolioId === portfolioId && currentWalletId !== portfolioId) {
        // Set current wallet to this portfolio when collapsing the wallet list
        setCurrentPortfolio(portfolioId)
      }
      this.setState({
        expandedPortfolios: {
          ...expandedPortfolios,
          [portfolioId]: expanded
        }
      })
    }
  }

  togglePortfolio(id) {
    this.setPortfolioExpanded(id, !this.state.expandedPortfolios[id])
  }

  connectWalletToPortfolio(portfolioId) {
    const { routerPush, setCurrentPortfolio } = this.props
    setCurrentPortfolio(portfolioId)
    routerPush('/connect')
  }

  componentWillReceiveProps(nextProps) {
    const { currentWalletId: nextWalletId, currentPortfolioId: nextPortfolioId } = nextProps
    const nextPortfolioExpanded = this.state.expandedPortfolios[nextPortfolioId]
    if (!nextPortfolioExpanded && nextWalletId !== nextPortfolioId) {
      // Expand the wallet list if the next wallet isn't visible
      this.setPortfolioExpanded(nextPortfolioId, true)
    }
  }

  render() {
    const {
      portfolioWalletIds, currentPortfolioId, currentWalletId,
      createNewPortfolio, setCurrentPortfolio, setCurrentWallet
    } = this.props
    
    return (
      <div>
        <Row className='gutter-3 align-items-end'>
          <Col>
            <h4 className='m-0 text-primary'>Portfolios</h4>
          </Col>
          <Col xs='auto'>
            <Button color='success' outline size='sm' onClick={() => createNewPortfolio(true)}><i className='fa fa-plus'/> add portfolio</Button>
          </Col>
          {Object.entries(portfolioWalletIds).map(([portfolioId, walletIds]) => {
            const showWallets = this.state.expandedPortfolios[portfolioId]
            return (
              <Col key={portfolioId} xs='12'>
                <Card>
                  <ListGroup>
                    <ListItem id={portfolioId}
                      active={currentWalletId === portfolioId}
                      onClick={() => setCurrentPortfolio(portfolioId)}/>
                    <ListGroupItem className='grid-group'>
                      <Row className='gutter-3'>
                        <Col xs='6'>
                          <Button color='ultra-dark' size='sm' className='grid-cell text-success text-center' onClick={() => this.connectWalletToPortfolio(portfolioId)}>
                            <i className='fa fa-plus'/> add wallet
                          </Button>
                        </Col>
                        <Col xs='6'>
                          <Button color='ultra-dark' size='sm' className='grid-cell text-center' onClick={() => this.togglePortfolio(portfolioId)}>
                            {showWallets
                              ? (<span><i className='fa fa-caret-up'/> hide wallets</span>)
                              : (<span><i className='fa fa-caret-down'/> show wallets</span>)}
                          </Button>
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
                        : (<ListGroupItem><i className='text-muted'>No wallets in this portfolio</i></ListGroupItem>)}
                    </Collapse>
                  </ListGroup>
                </Card>
              </Col>
            )
          })}
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
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)