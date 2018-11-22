import React, { Fragment } from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import {
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import classNames from 'class-names'

import { getWalletForAsset } from 'Utilities/wallet'
import { getAllWalletsBasedOnSymbol } from 'Selectors/wallet'

import withToggle from 'Hoc/withToggle'
import ReduxFormField from 'Components/ReduxFormField'
import WalletLabel from 'Components/WalletLabel'

const WalletSelectField = ({
  symbol, handleSelect, dropDownStyle, dropDownText,
  toggleDropdownOpen, isDropdownOpen, connectedWallets, handleConnect,
  selectedWallet, handleSelectManual, 
  ...props,
}) => {
  const hasWallets = connectedWallets.length > 0
  const renderInput = ({ className }) => (
    <WalletLabel
      wallet={selectedWallet}
      className={classNames('form-control', className, 'lh-0')} verticalAlign='middle'
      iconProps={{ width: '1.5em', height: '1.5em' }}/>
  )
  return (
    <ReduxFormField {...props} renderInput={selectedWallet && renderInput}
      addonAppend={({ invalid }) => (
        <ButtonDropdown addonType='append' isOpen={isDropdownOpen} toggle={toggleDropdownOpen}>
          <DropdownToggle size='sm' color={invalid ? 'danger' : 'dark'} style={dropDownStyle} caret>
            {dropDownText}
          </DropdownToggle>
          <DropdownMenu>
            {hasWallets ? (
              <Fragment>
                {connectedWallets.map((wallet) => (
                  <DropdownItem key={wallet.id}
                    onClick={() => handleSelect(symbol, wallet)}
                    active={selectedWallet && selectedWallet.id === wallet.id}>
                    <WalletLabel wallet={wallet}/>
                  </DropdownItem>
                ))}
                <DropdownItem onClick={handleSelectManual} active={!selectedWallet}>
                  External {symbol} wallet
                </DropdownItem>
                <DropdownItem divider/>
              </Fragment>
            ) : (
              <Fragment>
                <DropdownItem disabled><small><i>No Connected {symbol} wallets</i></small></DropdownItem>
              </Fragment>
            )}
            <DropdownItem className='text-primary' onClick={handleConnect}>
              <i className='nav-link-icon fa fa-plus'></i> Connect Your Wallet
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      )}/>
  )
}

export default compose(
  setDisplayName('WalletSelectField'),
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
  connect(createStructuredSelector({
    connectedWallets: (state, { symbol }) => getAllWalletsBasedOnSymbol(state, symbol),
  }), {
    push: pushAction
  }),
  withState('selectedWallet', 'setSelectedWallet', ({ connectedWallets }) => connectedWallets[0] || null),
  withToggle('dropdownOpen'),
  withHandlers({
    handleConnect: ({ push }) => () => {
      push('/connect')
    },
    handleSelectManual: ({ setSelectedWallet, change, name }) => () => {
      setSelectedWallet(null)
      change(name, '')
    },
    handleSelect: ({ setSelectedWallet, change, name }) => (symbol, wallet) => {
      const walletInstance = getWalletForAsset(wallet.id, symbol)
      setSelectedWallet(wallet)
      return walletInstance.getFreshAddress(symbol)
        .then((address) => change(name, address))
    }
  })
)(WalletSelectField)
  
