import * as React from 'react'
import { compose, setDisplayName, withProps, setPropTypes, withHandlers, defaultProps } from 'recompose'
// import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  NavLink,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap'
import withToggle from 'Hoc/withToggle'
import classNames from 'class-names'
import { createStructuredSelector } from 'reselect'
import { getSelectedLabel } from 'Selectors/currency'
import { setCurrencySymbol } from 'Actions/currency'
import { currencies } from 'Config/currencies'

import PropTypes from 'prop-types'

export default compose(
  setDisplayName('CurrencySelector'),
  setPropTypes({
    onSelect: PropTypes.func,
    showCode: PropTypes.bool,
  }),
  defaultProps({
    onSelect: () => {},
    showCode: true
  }),
  connect(createStructuredSelector({
    currentCurrency: getSelectedLabel
  }), {
    setCurrencySymbol,
  }),
  withProps(({ currentCurrency }) => {
    currentCurrency = currencies.find(l => l.label === currentCurrency) || currencies[0]
    return ({
      currentCurrency
    })
  }),
  withHandlers({
    handleSelect: ({ onSelect, setCurrencySymbol }) => (currency) => {
      setCurrencySymbol(currency)
      onSelect(currency)
    }
  }),
  withToggle('dropdownOpen'),
)(({ showCode, handleSelect, currentCurrency = {}, isDropdownOpen, toggleDropdownOpen, }) => (
  <Dropdown style={{ listStyleType: 'none' }} nav isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
    <DropdownToggle 
      tag={NavLink} 
      to={'/assets'}
      onClick={((e) => e.preventDefault())}
      className={'cursor-pointer mr-4'}
      caret
    >
      {showCode && <span>{`${currentCurrency.label} (${currentCurrency.symbol})`}</span>}
    </DropdownToggle>
    <DropdownMenu style={{ borderRadius: 2, borderColor: '#fff', maxHeight: 250, overflow: 'scroll' }} className='p-0'>
      {currencies.map((c, i) => (
        <DropdownItem key={c.label} onClick={() => handleSelect(c)} tag={'button'} style={{ backgroundColor: '#fff', borderTop: '1px solid #ECEFF7' }} className={classNames(i === 0 && 'border-0','border-left-0 text-muted py-2')}>
          <span style={{ color: '#333' }}>{c.label} ({c.symbol})</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
))