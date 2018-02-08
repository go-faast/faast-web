import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import HardwareWalletView from './view'
import toastr from 'Utilities/toastrWrapper'
import { timer } from 'Utilities/helpers'
import { toMainDenomination } from 'Utilities/convert'
import log from 'Utilities/log'
import { closeTrezorWindow } from 'Utilities/wallet'
import config from 'Config'
import { openWallet } from 'Actions/portfolio'
import { mockAddress } from 'Actions/mock'
import web3 from 'Services/Web3'
import { EthereumWalletLedger, EthereumWalletTrezor, BitcoinWalletTrezor } from 'Services/Wallet'
import Trezor from 'Services/Trezor'

const CONNECT_SECONDS = 6
const ADDRESS_GROUP_SIZE = 5
let hwConnectTimer
let hwConnectTimerTimeout

const initialState = {
  showModal: false,
  showAddressSelect: false,
  addressIxGroup: 0,
  addresses: [],
  commStatus: '',
  seconds: CONNECT_SECONDS,
  addressIxSelected: null,
  getAddress: () => Promise.resolve(),
}

class HardwareWallet extends Component {
  constructor (props) {
    super(props)
    this.state = Object.assign({}, initialState, {
      derivationPath: config.hdDerivationPath[props.type]
    })
    this._handleOpenModal = this._handleOpenModal.bind(this)
    this._handleToggleModal = this._handleToggleModal.bind(this)
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleToggleAddressSelect = this._handleToggleAddressSelect.bind(this)
    this._clearAsync = this._clearAsync.bind(this)
    this._connect = this._connect.bind(this)
    this._connectLedger = this._connectLedger.bind(this)
    this._connectTrezor = this._connectTrezor.bind(this)
    this._getAddresses = this._getAddresses.bind(this)
    this._handleChangeAddressIxGroup = this._handleChangeAddressIxGroup.bind(this)
    this._handleSelectAddressIx = this._handleSelectAddressIx.bind(this)
    this._handleChangeDerivationPath = this._handleChangeDerivationPath.bind(this)
    this._handleChooseAddress = this._handleChooseAddress.bind(this)
    this._handleChooseFirstAddress = this._handleChooseFirstAddress.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.showModal && this.state.showModal) {
      this._connect()
    }
    if (prevState.showModal && !this.state.showModal) {
      this._clearAsync()
    }
  }

  _handleOpenModal () {
    this.setState({ showModal: true })
  }

  _handleToggleModal () {
    this.setState({ showModal: !this.state.showPasswordModal })
  }

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState(Object.assign({}, initialState, {
      derivationPath: config.hdDerivationPath[this.props.type]
    }))
  }

  _handleToggleAddressSelect () {
    this.setState({ showAddressSelect: !this.state.showAddressSelect })
  }

  _clearAsync () {
    window.clearInterval(hwConnectTimer)
    window.clearTimeout(hwConnectTimerTimeout)
  }

  _connect () {
    if (!window.faast || !window.faast.hw) {
      return toastr.error('Error: hardware wallet support unavailable')
    }
    const type = this.props.type
    this._clearAsync()
    this.setState({
      seconds: CONNECT_SECONDS,
      addressIxGroup: 0
    })

    const { derivationPath } = this.state
    if (this.props.mock.mocking && Array.isArray(this.props.mock.hw) && this.props.mock.hw.includes(type)) {
      return window.setTimeout(() => {
        this.setState({ commStatus: 'connected', getAddress: (i) => Promise.resolve(this.props.mockAddress(derivationPath, i)) })
        this._getAddresses()
      }, 3000)
    }

    if (type === 'ledger') this._connectLedger()
    if (type === 'trezor') this._connectTrezor()
  }

  _connectLedger () {
    if (!window.faast.hw.ledger) {
      return toastr.error('Error: Ledger comm unavailable')
    }

    const setSeconds = (sec) => {
      this.setState({ seconds: sec })
    }

    const resetTimer = () => {
      this.setState({ commStatus: 'waiting', seconds: CONNECT_SECONDS })
      hwConnectTimer = timer(CONNECT_SECONDS, setSeconds, ledgerConnect)
    }

    const ledgerError = (e) => {
      log.error(e)
      hwConnectTimerTimeout = window.setTimeout(resetTimer, 1000)
    }

    const ledgerConnect = () => {
      const { derivationPath } = this.state
      this.setState({ commStatus: 'connecting' })

      return EthereumWalletLedger.connect(derivationPath)
        .then(({ getAddress }) => {
          this.setState({ commStatus: 'connected', getAddress })
          this._getAddresses()
        })
        .catch(ledgerError)
    }
    ledgerConnect()
  }

  _connectTrezor () {
    if (!Trezor) {
      return toastr.error('Error: Trezor Connect unavailable')
    }

    const { derivationPath } = this.state
    this.setState({ commStatus: 'connecting' })

    const trezorError = (e) => {
      log.error(e)
      toastr.error(`Error from Trezor - ${e.message}`)
      this._handleCloseModal()
    }
    return EthereumWalletTrezor.connect(derivationPath)
      .then(({ getAddress }) => {
        this.setState({ commStatus: 'connected', getAddress })
        this._getAddresses()
      })
      .catch(trezorError)
  }

  _getAddresses () {
    const ixGroup = this.state.addressIxGroup
    const getAddress = this.state.getAddress
    const startIndex = ixGroup * (ADDRESS_GROUP_SIZE)
    const endIndex = startIndex + (ADDRESS_GROUP_SIZE - 1)
    for (let i = startIndex; i <= endIndex; i++) {
      getAddress(i)
      .then((address) => {
        const addresses = this.state.addresses
        addresses[i] = { address }
        this.setState({ addresses })
        web3.eth.getBalance(address)
        .then((res) => {
          this.setState({
            addresses: this.state.addresses.map((item, index) => {
              if (index !== i) return item
              return Object.assign({}, item, {
                balance: toMainDenomination(res, 18)
              })
            })
          })
        })
        .catch(log.error)
      })
      .catch(log.error)
    }
  }

  _handleChangeAddressIxGroup (incr) {
    const newIxGroup = this.state.addressIxGroup + incr
    if (newIxGroup >= 0) {
      this.setState({ addressIxGroup: newIxGroup, addressIxSelected: null })
      this._getAddresses()
    }
  }

  _handleSelectAddressIx (event) {
    this.setState({ addressIxSelected: event.target.value })
  }

  _handleChangeDerivationPath (path) {
    this.setState({
      addresses: [],
      addressIxGroup: 0,
      addressIxSelected: null,
      derivationPath: path
    })
    this._connect()
  }

  _handleChooseAddress (selected = 0) {
    const { addresses, derivationPath, addressIxGroup } = this.state
    const ix = addressIxGroup * ADDRESS_GROUP_SIZE + selected
    const { address } = addresses[ix]
    const addressPath = `${derivationPath}/${ix}`
    const { type, openWallet, routerPush, mock: { mocking: isMocking } } = this.props
    let wallet
    if (type === 'ledger') {
      wallet = new EthereumWalletLedger(address, addressPath)
      openWallet(wallet, isMocking)
        .then(() => routerPush('/balances'))
    } else if (type === 'trezor') {
      wallet = new EthereumWalletTrezor(address, addressPath)
      BitcoinWalletTrezor.fromPath()
        .then((bitcoinWallet) => openWallet(bitcoinWallet, isMocking))
        .then(() => openWallet(wallet, isMocking))
        .then(() => closeTrezorWindow())
        .then(() => routerPush('/balances'))
    } else {
      throw new Error(`Unknown hardware wallet type ${type}`)
    }
    log.info('Hardware wallet set')
  }

  _handleChooseFirstAddress () {
    this._handleChooseAddress(0)
  }

  render () {
    const startIndex = this.state.addressIxGroup * ADDRESS_GROUP_SIZE
    const endIndex = startIndex + (ADDRESS_GROUP_SIZE - 1)
    const firstAddress = this.state.addresses[0]
    const modalProps = {
      isOpen: this.state.showModal,
      handleToggle: this._handleToggleModal,
      handleClose: this._handleCloseModal,
      commStatus: this.state.commStatus,
      seconds: this.state.seconds,
      firstAddress,
      handleChooseFirstAddress: this._handleChooseFirstAddress,
      showAddressSelect: this.state.showAddressSelect,
      handleToggleAddressSelect: this._handleToggleAddressSelect,
      addressSelectProps: {
        addressIxSelected: this.state.addressIxSelected,
        addresses: this.state.addresses,
        derivationPath: this.state.derivationPath,
        handleChangeAddressIxGroup: this._handleChangeAddressIxGroup,
        handleSelectAddressIx: this._handleSelectAddressIx,
        handleChangeDerivationPath: this._handleChangeDerivationPath,
        handleChooseAddress: this._handleChooseAddress,
        startIndex,
        endIndex
      }
    }
    return (
      <HardwareWalletView
        handleClick={this._handleOpenModal}
        modalProps={modalProps}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = {
  openWallet,
  mockAddress,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(HardwareWallet)
