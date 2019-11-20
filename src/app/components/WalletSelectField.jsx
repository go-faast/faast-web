import React, { Fragment } from 'react'
import routes from 'Routes'
import {
  compose, setDisplayName, setPropTypes, defaultProps, withHandlers, lifecycle, withProps,
} from 'recompose'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import {
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import classNames from 'class-names'

import { sortByProperty } from 'Utilities/helpers'
import { getWalletForAsset } from 'Utilities/wallet'
import propTypes from 'Utilities/propTypes'
import { getCurrentPortfolioWalletsForSymbol, areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getWallet } from 'Selectors/wallet'

import withToggle from 'Hoc/withToggle'
import ReduxFormField from 'Components/ReduxFormField'
import WalletLabel from 'Components/WalletLabel'

const WalletSelectField = ({
  tag: Tag, symbol, handleSelect, dropDownStyle, disableNoBalance, walletHasBalance, showBalances,
  toggleDropdownOpen, isDropdownOpen, connectedWallets, handleConnect,
  selectedWallet, handleSelectManual, addressFieldName, walletIdFieldName,
  onChange, ...props,
}) => {
  const renderInput = ({ className }) => (
    <WalletLabel
      wallet={selectedWallet}
      className={classNames('form-control', className, 'lh-0')} verticalAlign='middle'
      iconProps={{ width: '1.5em', height: '1.5em' }}/>
  )
  const dropDownText = !selectedWallet ? 'External' : 'Wallet'
  return (
    <Fragment>
      <Tag {...props}
        name={addressFieldName}
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        onChange={onChange}
        renderInput={selectedWallet && renderInput}
        addonAppend={({ invalid }) => (
          <ButtonDropdown addonType='append' isOpen={isDropdownOpen} toggle={toggleDropdownOpen}>
            <DropdownToggle size='sm' color={invalid ? 'danger' : 'dark'} style={dropDownStyle} caret>
              {dropDownText}
            </DropdownToggle>
            <DropdownMenu right>
              {connectedWallets.map((wallet) => (
                <DropdownItem key={wallet.id}
                  onClick={() => handleSelect(wallet.id)}
                  active={selectedWallet && (selectedWallet.id === wallet.id || wallet.nestedWalletIds.includes(selectedWallet.id))}
                  disabled={disableNoBalance && !walletHasBalance(wallet)}>
                  <WalletLabel wallet={wallet} showBalance={showBalances && symbol}/>
                </DropdownItem>
              ))}
              <DropdownItem onClick={handleSelectManual} active={!selectedWallet}>
                External {symbol} wallet
              </DropdownItem>
              <DropdownItem divider/>
              <DropdownItem className='text-primary' onClick={handleConnect}>
                <i className='nav-link-icon fa fa-plus'></i> Connect Your Wallet
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        )}/>
      <ReduxFormField name={walletIdFieldName} type='hidden'/>
    </Fragment>
  )
}

export default compose(
  setDisplayName('WalletSelectField'),
  setPropTypes({
    addressFieldName: PropTypes.string.isRequired,
    walletIdFieldName: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired, // change prop passed into decorated redux-form component
    untouch: PropTypes.func.isRequired, // untouch prop passed into decorated redux-form component
    dropDownStyle: PropTypes.object,
    handleSelect: PropTypes.func,
    symbol: PropTypes.string,
    tag: propTypes.tag,
    disableNoBalance: PropTypes.bool,
    showBalances: PropTypes.bool,
    defaultValue: PropTypes.string,
    formName: PropTypes.string,
    onChange: PropTypes.func,
  }),
  defaultProps({
    dropDownStyle: {},
    symbol: '',
    tag: ReduxFormField,
    disableNoBalance: false,
    showBalances: true,
  }),
  withProps(({
    formName
  }) => { 
    return ({
      getFormValue: formValueSelector(formName)
    })}),
  connect((state, props) => {
    const { symbol, addressFieldName, walletIdFieldName, getFormValue } = props
    const address = getFormValue(state, addressFieldName)
    const walletId = getFormValue(state, walletIdFieldName)
    const selectedWallet = walletId ? getWallet(state, walletId) : null
    return {
      connectedWallets: getCurrentPortfolioWalletsForSymbol(state, symbol),
      balancesLoaded: areCurrentPortfolioBalancesLoaded(state, props),
      address,
      walletId,
      selectedWallet,
    }
  }, {
    push: pushAction
  }),
  withToggle('dropdownOpen'),
  withHandlers({
    handleConnect: ({ push }) => () => {
      push({
        pathname: '/connect',
        state: { forwardurl: routes.swapWidget() }
      })
    },
    handleSelect: ({ change, untouch, addressFieldName, walletIdFieldName, symbol }) => (wallet) => {
      if (!wallet) {
        change(walletIdFieldName, '')
        change(addressFieldName, '')
        untouch(addressFieldName)
        return
      }
      const walletId = typeof wallet === 'string' ? wallet : wallet.id
      const walletInstance = getWalletForAsset(walletId, symbol)
      if (walletInstance) {
        change(walletIdFieldName, walletInstance.getId())
        return walletInstance.getFreshAddress(symbol)
          .then((address) => change(addressFieldName, address))
      } else {
        change(walletIdFieldName, walletId)
      }
    },
    walletHasBalance: ({ symbol }) => ({ balances }) => Boolean(balances[symbol] && balances[symbol].gt(0))
  }),
  withProps(({ connectedWallets, disableNoBalance, walletHasBalance }) => {
    const selectableWallets = disableNoBalance ? connectedWallets.filter(walletHasBalance) : connectedWallets
    return {
      selectableWallets,
      selectableWalletIds: selectableWallets.map(({ id }) => id),
    }
  }),
  withHandlers({
    handleSelectManual: ({ handleSelect }) => () => handleSelect(null),
    selectDefault: ({ selectableWallets, handleSelect }) => () => {
      const ordered = sortByProperty(selectableWallets, 'isReadOnly')
      handleSelect(ordered[0] || null)
    },
  }),
  lifecycle({
    componentWillMount() {
      const { walletId, address, selectDefault, handleSelect, selectableWalletIds, change, addressFieldName, } = this.props
      if (!walletId && !address) {
        selectDefault()
      } else if (walletId) {
        handleSelect(walletId)
      }
    },
    componentDidUpdate(prevProps) {
      const {
        symbol, selectedWallet, selectableWalletIds, selectDefault, handleSelect, balancesLoaded, defaultValue
      } = this.props
      const symbolChange = prevProps.symbol !== symbol
      if (symbolChange) {
        if (selectedWallet) {
          if (!selectableWalletIds.includes(selectedWallet.id)) {
            selectDefault()
          } else {
            // reselect current to get new address for symbol
            handleSelect(selectedWallet)
          }
        } else if (defaultValue) {
          const walletId = selectableWalletIds.find(walletId => walletId.toLowerCase() === defaultValue.toLowerCase())
          if (walletId) {
            handleSelect(walletId)
          }
        } else {
          selectDefault()
        }
      } else if (!prevProps.balancesLoaded && balancesLoaded) {
        selectDefault()
      }
    }
  })
)(WalletSelectField)
  
