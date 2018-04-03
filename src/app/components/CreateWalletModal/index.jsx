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
  hasDownloadedFile: false,
  agreedToDisclaimer: false
}

class CreateWalletModal extends Component {
  constructor () {
    super()
    this.generateKeystore = this.generateKeystore.bind(this)
    this.state = {
      ...initialState,
      createdWallet: this.generateKeystore()
    }
  }

  generateKeystore () {
    return EthereumWalletKeystore.generate()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.showModal && !this.props.showModal) {
      // Generate new keystore upon showing modal so address can be included
      // in create password form as hidden field (helps password managers)
      this.setState({ createdWallet: this.generateKeystore() })
    }
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
    if (passwordConfirm !== password) {
      return 'Passwords do not match'
    }
  }

  handleDisclaimerAgreedChange = (event, disclaimerAgreed) => {
    this.setState({
      agreedToDisclaimer: disclaimerAgreed,
    })
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

    Promise.resolve(this.state.createdWallet)
      .then((createdWallet) => createdWallet.getFileName(password)
        .then((fileName) => this.setState({
          view: 'download',
          createdWallet: createdWallet.encrypt(password),
          fileName
        })))
      .catch((e) => {
        log.error('handleCreatePassword', e)
        toastr.error(`Error creating ${walletName}`)
      })
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
    const { isNewWallet, openWallet, routerPush, handleContinue } = this.props
    if (isNewWallet) {
      openWallet(this.state.createdWallet)
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
    const { hasDownloadedFile, agreedToDisclaimer, createdWallet } = this.state
    return (
      <CreateWalletModalView
        view={this.state.view}
        handleImportPrivKey={this.handleImportPrivKey}
        handleCreatePassword={this.handleCreatePassword}
        handleCloseModal={this.handleCloseModal}
        handleDownload={this.handleDownload}
        handleContinue={this.handleContinue}
        handleDisclaimerAgreedChange={this.handleDisclaimerAgreedChange}
        validatePassword={this.validatePassword}
        validatePasswordConfirm={this.validatePasswordConfirm}
        agreedToDisclaimer={agreedToDisclaimer}
        showModal={showModal}
        isNewWallet={isNewWallet}
        hasDownloadedFile={hasDownloadedFile}
        walletName={this.getWalletName()}
        walletAddress={createdWallet && createdWallet.getAddress()}
      />
    )
  }
}

CreateWalletModal.propTypes = {
  isNewWallet: PropTypes.bool,
  showWallet: PropTypes.bool,
}

const mapDispatchToProps = {
  openWallet,
  routerPush: push,
}

export default connect(null, mapDispatchToProps)(CreateWalletModal)
