import React, { Fragment } from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import { getWalletForAsset } from 'Utilities/wallet'
import withToggle from 'Hoc/withToggle'

import { getAllWalletsBasedOnSymbol } from 'Selectors/wallet'

const WalletSelectField = ({
  symbol, handleSelect, dropDownStyle, dropDownText, 
  toggleDropdownOpen, isDropdownOpen, connectedWallets, handleConnect,
  ...props,
}) => {
  const hasWallets = connectedWallets.length > 0
  return (
    <ReduxFormField 
      addonAppend={({ invalid }) => (
        <InputGroupButtonDropdown addonType='append' isOpen={isDropdownOpen} toggle={toggleDropdownOpen}>
          <DropdownToggle size='sm' color={invalid ? 'danger' : 'dark'} style={dropDownStyle} caret>
            {dropDownText}
          </DropdownToggle>
          <DropdownMenu>
            {hasWallets ? (
              <Fragment>
                <DropdownItem header><small>Connected {symbol} Wallets</small></DropdownItem> 
                {connectedWallets.map(({ id, label }) => (
                  <DropdownItem key={id} onClick={() => handleSelect(symbol, id)}>{label}</DropdownItem>
                ))}
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
    name: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired, // change prop passed into decorated redux-form component
    dropDownText: PropTypes.string,
    dropDownStyle: PropTypes.object,
    handleSelect: PropTypes.func,
    symbol: PropTypes.string,
  }),
  defaultProps({
    dropDownText: 'Select Wallet',
    dropDownStyle: {},
    symbol: '',
  }),
  withToggle('dropdownOpen'),
  withHandlers({
    handleConnect: ({ push }) => () => {
      push('/connect')
    },
    handleSelect: ({ change, name }) => (symbol, walletId) => {
      const walletInstance = getWalletForAsset(walletId, symbol)
      return walletInstance.getFreshAddress(symbol)
        .then((address) => change(name, address))
    }
  })
)(WalletSelectField)
  
