import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { setCurrentPortfolio, createNewPortfolio } from 'Actions/portfolio'
import { getAllPortfolioIds, getCurrentPortfolioId, getCurrentPortfolioLabel } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'
import T from 'Components/i18n/T'

const SelectPortfolioDropdown = ({ portfolioIds, currentPortfolioId, currentPortfolioLabel, changePortfolio, createPortfolio, showCreatePortfolio, togglerProps, ...props }) => (
  <UncontrolledDropdown {...props}>
    <DropdownToggle caret {...togglerProps}>
      {currentPortfolioLabel}
    </DropdownToggle>
    <DropdownMenu>
      {portfolioIds.map((portfolioId) => (
        <DropdownItem key={portfolioId} active={portfolioId === currentPortfolioId} onClick={() => changePortfolio(portfolioId)}>
          <WalletSummary.Connected id={portfolioId}/>
        </DropdownItem>
      ))}
      {showCreatePortfolio && ([
        <DropdownItem key='1' divider />,
        <DropdownItem key='2' onClick={() => createPortfolio(true)}>
          <small className='m-0 font-weight-normal text-primary'><i className='fa fa-plus'/> <T tag='span' i18nKey='app.selectPortfolioDropdown.add'>add portfolio</T></small>
        </DropdownItem>
      ])}
    </DropdownMenu>
  </UncontrolledDropdown>
)

SelectPortfolioDropdown.propTypes = {
  showCreatePortfolio: PropTypes.bool,
}

SelectPortfolioDropdown.defaulProps = {
  showCreatePortfolio: false
}

const mapStateToProps = createStructuredSelector({
  portfolioIds: getAllPortfolioIds,
  currentPortfolioId: getCurrentPortfolioId,
  currentPortfolioLabel: getCurrentPortfolioLabel
})

const mapDispatchToProps = {
  changePortfolio: setCurrentPortfolio,
  createPortfolio: createNewPortfolio,
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectPortfolioDropdown)