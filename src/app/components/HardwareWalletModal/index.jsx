import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import config from 'Config'
import { setStatePromise } from 'Utilities/reactFuncs'
import log from 'Utilities/log'
import { closeTrezorWindow } from 'Utilities/wallet'

import { openWallet } from 'Actions/access'
import {
  reset, changeDerivationPath, connectEthereum, changeAccountPage, toggleShowAccountSelect, changeAccountIndex,
} from 'Actions/connectHardwareWallet'

import {
  getDerivationPath, getRetryTimerSeconds, getStatus, getShowAccountSelect, getSelectedAccount,
  getSelectedPageAccounts, getSelectedPageIndex, getAccountPageStartIndex, getAccountPageEndIndex, 
} from 'Selectors/connectHardwareWallet'

import { EthereumWalletLedger, EthereumWalletTrezor, BitcoinWalletTrezor } from 'Services/Wallet'

import HardwareWalletModalView from './view'

class HardwareWalletModal extends Component {
  constructor (props) {
    super(props)
    this.setStatePromise = (newState) => setStatePromise(this, newState)
    this.connectAll = this.connectAll.bind(this)
    this.handleSelectIndex = this.handleSelectIndex.bind(this)
    this.handleConfirmAccountSelection = this.handleConfirmAccountSelection.bind(this)
  }

  componentDidMount () {
    this.connectAll()
  }

  componentWillUnmount () {
    closeTrezorWindow()
    this.props.reset()
  }

  connectAll () {
    const { isOpen, connectEthereum, type } = this.props
    if (isOpen) {
      connectEthereum(type)
    }
  }

  handleSelectIndex (index) {
    this.props.changeAccountIndex(Number.parseInt(index))
    this.props.toggleAccountSelect()
  }

  handleChangeDerivationPath (path) {
    const { derivationPath, changeDerivationPath, connectEthereum } = this.props
    if (derivationPath !== path) {
      changeDerivationPath(path)
      connectEthereum()
    }
  }

  handleConfirmAccountSelection () {
    const { type, openWallet, routerPush, derivationPath, selectedAccount } = this.props
    const { id, index } = selectedAccount
    const accountPath = `${derivationPath}/${index}`
    let wallet
    if (type === 'ledger') {
      wallet = new EthereumWalletLedger(id, accountPath)
      openWallet(wallet)
        .then(() => routerPush('/dashboard'))
    } else if (type === 'trezor') {
      wallet = new EthereumWalletTrezor(id, accountPath)
      openWallet(wallet)
        .then(() => BitcoinWalletTrezor.fromPath())
        .then(openWallet)
        .then(() => closeTrezorWindow())
        .then(() => routerPush('/dashboard'))
    }
    log.info('Hardware wallet set')
  }

  render () {
    const {
      commStatus, retrySeconds, derivationPath, changeAccountPage, toggleAccountSelect,
      selectedAccount, selectedPageAccounts, selectedPageIndex, selectedPageStartIndex, selectedPageEndIndex
    } = this.props
    const { id: selectedAccountId } = selectedAccount || {}
    const viewProps = {
      name: config.walletTypes.name,
      confirmAccountSelection: this.handleConfirmAccountSelection,
      onConfirm: this.handleConfirmAccountSelection,
      disableConfirm: typeof selectedAccountId === 'undefined' || selectedAccountId === null,
      commStatusProps: {
        status: commStatus,
        seconds: retrySeconds,
        handleManualRetry: this.connectAll,
      },
      confirmAccountSelectionProps: {
        account: selectedAccount,
        toggleAccountSelect
      },
      accountSelectProps: {
        startIndex: selectedPageStartIndex,
        endIndex: selectedPageEndIndex,
        page: selectedPageIndex,
        accounts: selectedPageAccounts,
        derivationPath,
        selectIndex: this.handleSelectIndex,
        changePage: changeAccountPage,
        changePath: this.handleChangeDerivationPath,
      }
    }
    return (
      <HardwareWalletModalView
        {...this.props}
        {...viewProps}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  derivationPath: getDerivationPath,
  retrySeconds: getRetryTimerSeconds,
  commStatus: getStatus,
  showAccountSelect: getShowAccountSelect,
  selectedAccount: getSelectedAccount,
  selectedPageAccounts: getSelectedPageAccounts,
  selectedPageIndex: getSelectedPageIndex,
  selectedPageStartIndex: getAccountPageStartIndex,
  selectedPageEndIndex: getAccountPageEndIndex,
})

const mapDispatchToProps = {
  openWallet,
  routerPush: push,
  reset,
  connectEthereum,
  changeDerivationPath,
  changeAccountPage,
  changeAccountIndex,
  toggleAccountSelect: toggleShowAccountSelect,
}

HardwareWalletModal.propTypes = {
  type: PropTypes.oneOf(Object.keys(config.walletTypes)).isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(HardwareWalletModal)
