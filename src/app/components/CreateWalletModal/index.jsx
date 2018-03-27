import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import CreateWalletModalView from './view'
import toastr from 'Utilities/toastrWrapper'
import { downloadJson } from 'Utilities/helpers'
import log from 'Utilities/log'
import { openWallet } from 'Actions/access'
import { EthereumWalletKeystore } from 'Services/Wallet'

const initialState = {
  view: 'create',
  createdWallet: null,
  fileName: null,
  hasDownloadedFile: false
}

class CreateWalletModal extends Component {
  constructor () {
    super()
    this.state = initialState
  }

  getWalletName = () => this.props.isNewWallet ? 'wallet' : 'keystore'

  validatePassword = (password) => {
    const walletName = this.getWalletName()
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 8) {
      return `Please at least 8 characters. It is important to secure your ${walletName} with a strong password.`
    }
  }

  validatePasswordConfirm = (passwordConfirm, { password }) => {
    if (!passwordConfirm) {
      return 'Please confirm your password'
    }
    if (passwordConfirm !== password) {
      return 'Passwords do not match'
    }
  }

  validateDisclaimerAgreed = (disclaimerAgreed) => {
    if (!disclaimerAgreed) {
      return 'Please check that you\'ve read and understand the disclaimer'
    }
  }

  handleImportPrivKey = (formValues) => {
    let { privateKey } = formValues
    privateKey = privateKey.trim()
    const wallet = EthereumWalletKeystore.fromPrivateKey(privateKey)
    this.setState({ view: 'create', createdWallet: wallet })
  }

  handleCreatePassword = (formValues) => {
    const { password } = formValues
    const walletName = this.getWalletName()
    let createdWallet = this.state.createdWallet
    if (!createdWallet) {
      createdWallet = EthereumWalletKeystore.generate()
    }
    try {
      const fileName = createdWallet.getFileName(password)
      this.setState({
        view: 'download',
        createdWallet: createdWallet.encrypt(password),
        fileName
      })
    } catch (e) {
      log.error('handleCreatePassword', e)
      toastr.error(`Error creating ${walletName}`)
    }
  }

  handleDownload = () => {
    downloadJson(this.state.createdWallet.keystore, this.state.fileName, true)
      .then(() => {
        this.setState({ hasDownloadedFile: true })
      })
      .catch(() => {
        toastr.error('Sorry, there was a problem with your request')
      })
  }

  handleContinue = () => {
    if (!this.state.hasDownloadedFile) {
      return toastr.error('Please download the wallet keystore file before continuing')
    }
    const { isNewWallet, openWallet, routerPush, handleContinue, mock: { mocking } } = this.props
    if (isNewWallet) {
      openWallet(this.state.createdWallet, mocking)
        .then(() => routerPush('/balances'))
    } else {
      handleContinue ? handleContinue() : this._handleCloseModal()
    }
  }

  handleCloseModal = () => {
    this.setState(initialState)
    this.props.toggleModal()
  }

  render () {
    const { isNewWallet, showModal } = this.props
    const { hasDownloadedFile } = this.state
    return (
      <CreateWalletModalView
        view={this.state.view}
        handleImportPrivKey={this.handleImportPrivKey}
        handleCreatePassword={this.handleCreatePassword}
        handleCloseModal={this.handleCloseModal}
        handleDownload={this.handleDownload}
        handleContinue={this.handleContinue}
        validatePassword={this.validatePassword}
        validatePasswordConfirm={this.validatePasswordConfirm}
        validateDisclaimerAgreed={this.validateDisclaimerAgreed}
        showModal={showModal}
        isNewWallet={isNewWallet}
        hasDownloadedFile={hasDownloadedFile}
        walletName={this.getWalletName()}
      />
    )
  }
}

const mapDispatchToProps = {
  openWallet,
  routerPush: push,
}

export default connect(null, mapDispatchToProps)(CreateWalletModal)
