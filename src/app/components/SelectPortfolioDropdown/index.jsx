import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { setCurrentPortfolio, createNewPortfolio } from 'Actions/portfolio'
import { getAllPortfolioIds, getCurrentPortfolioId } from 'Selectors'
import PortfolioSummary from './PortfolioSummary'

const SelectPortfolioDropdown = ({ portfolioIds, currentPortfolioId, changePortfolio, createPortfolio }) => (
  <UncontrolledDropdown>
    <DropdownToggle caret color='faast'>
      Select Portfolio
    </DropdownToggle>
    <DropdownMenu>
      {portfolioIds.map((portfolioId) => (
        <DropdownItem key={portfolioId} active={portfolioId === currentPortfolioId} onClick={() => changePortfolio(portfolioId)}>
          <PortfolioSummary id={portfolioId}/>
        </DropdownItem>
      ))}
      <DropdownItem divider />
      <DropdownItem onClick={() => createPortfolio(true)}><h5>create new portfolio</h5></DropdownItem>
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