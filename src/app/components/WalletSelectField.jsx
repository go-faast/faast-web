import React, { Fragment } from 'react'
import { compose, setDisplayName, withStateHandlers, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'

import { getAllWalletsBasedOnSymbol } from 'Selectors/wallet'

const WalletSelectField = ({ valid, symbol, handleSelect, dropDownStyle, dropDownText, 
  toggleDropDown, dropdownOpen, connectedWallets, handleConnect, ...props, }) => {
  const hasWallets = connectedWallets.length > 0
  return (
    <ReduxFormField 
      addonAppend={(
        <InputGroupButtonDropdown addonType="append" isOpen={dropdownOpen} toggle={toggleDropDown}>
          <DropdownToggle size='sm' color={valid ? 'dark' : 'danger'} style={dropDownStyle} caret>
            {dropDownText}
          </DropdownToggle>
          <DropdownMenu>
            {hasWallets ? (
              <Fragment>
                <DropdownItem header><small>Connected {symbol} Wallets</small></DropdownItem> 
                {connectedWallets.map(wallet => {
                  const { id, label } = wallet
                  return (
                    <DropdownItem key={id} onClick={() => handleSelect(symbol, id)}>{label}</DropdownItem>
                  )
                })}
                <DropdownItem divider/>
              </Fragment>
            ) : (
              <Fragment>
                <DropdownItem><small>No Connected {symbol} Wallets</small></DropdownItem>
              </Fragment>
            )}
            <DropdownItem className='text-primary' onClick={handleConnect}>
              <i className='nav-link-icon fa fa-plus'></i> Connect Your Wallet
            </DropdownItem>
          </DropdownMenu>
        </InputGroupButtonDropdown>
      )}
      {...props} 
    />
  )
}

export default compose(
    setDisplayName('WalletSelectField'),
    connect(createStructuredSelector({
      connectedWallets: (state, { symbol }) => getAllWalletsBasedOnSymbol(state, symbol),
    }), {
      push: pushAction
    }),
    setPropTypes({
      dropDownText: PropTypes.string,
      dropDownStyle: PropTypes.object,
      handleSelect: PropTypes.func,
      symbol: PropTypes.string,
      valid: PropTypes.bool,
    }),
    defaultProps({
      dropDownText: 'Select Wallet',
      dropDownStyle: {},
      handleSelect: () => {},
      symbol: '',
      valid: true
    }),
    withStateHandlers(
      { dropdownOpen: false },
      { toggleDropDown: ({ dropdownOpen }) => () => ({ dropdownOpen: !dropdownOpen }) },
    ),
    withHandlers({
      handleConnect: ({ push }) => () => {
        push('/connect')
      }
    })
  )(WalletSelectField)
  
