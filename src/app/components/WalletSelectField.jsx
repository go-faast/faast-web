import React, { Fragment } from 'react'
import { compose, setDisplayName, withStateHandlers, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import ReduxFormField from 'Components/ReduxFormField'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import { Address } from 'bitcore-lib'
import web3 from 'Services/Web3'

import { getAllWalletsArray } from 'Selectors/wallet'

const WalletSelectField = ({ valid, handleSelect, dropDownStyle, dropDownText, 
  toggleDropDown, dropdownOpen, connectedWallets, handleConnect, ERC20, ...props }) => {
  const hasWallets = connectedWallets.length > 1
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
                <DropdownItem header><small>Connected Wallets</small></DropdownItem> 
                {connectedWallets.map(wallet => {
                  const { id } = wallet
                  if (id !== 'default' && ((web3.utils.isAddress(id) && ERC20) || Address.isValid(id) && !ERC20)) {
                    return (
                      <DropdownItem onClick={() => handleSelect(id)}>{id}</DropdownItem>
                    )
                  }
                })}
                <DropdownItem divider/>
              </Fragment>
            ) : (
              <Fragment>
                <DropdownItem><small>No Connected Wallets</small></DropdownItem>
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
      connectedWallets: getAllWalletsArray,
    }), {
      push: pushAction
    }),
    setPropTypes({
      dropDownText: PropTypes.string,
      dropDownStyle: PropTypes.object,
      handleSelect: PropTypes.func,
      ERC20: PropTypes.bool,
      valid: PropTypes.bool,
    }),
    defaultProps({
      dropDownText: 'Select Wallet',
      dropDownStyle: {},
      handleSelect: () => {},
      ERC20: false,
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
  
