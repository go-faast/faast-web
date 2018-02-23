import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { setCurrentPortfolio, createNewPortfolio } from 'Actions/portfolio'
import { getAllPortfolioIds, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'

const SelectPortfolioDropdown = ({ portfolioIds, currentPortfolioId, changePortfolio, createPortfolio }) => (
  <UncontrolledDropdown>
    <DropdownToggle caret color='faast'>
      Select Portfolio
    </DropdownToggle>
    <DropdownMenu>
      {portfolioIds.map((portfolioId) => (
        <DropdownItem key={portfolioId} active={portfolioId === currentPortfolioId} onClick={() => changePortfolio(portfolioId)}>
          <WalletSummary.Connected id={portfolioId}/>
        </DropdownItem>
      ))}
      <DropdownItem divider />
      <DropdownItem onClick={() => createPortfolio(true)}><h6 className='my-0 font-weight-normal'>+ add portfolio</h6></DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
)

const mapStateToProps = createStructuredSelector({
  portfolioIds: getAllPortfolioIds,
  currentPortfolioId: getCurrentPortfolioId,
})

const mapDispatchToProps = {
  changePortfolio: setCurrentPortfolio,
  createPortfolio: createNewPortfolio,
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectPortfolioDropdown)