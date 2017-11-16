import React, { Component } from 'react'
import { connect } from 'react-redux'
import HDKey from 'hdkey'
import EthereumJsUtil from 'ethereumjs-util'
import HardwareWallet from 'Views/HardwareWallet'
import toastr from 'Utilities/toastrWrapper'
import { timer } from 'Utilities/helpers'
import { sessionStorageSet } from 'Utilities/storage'
import { toMainDenomination } from 'Utilities/convert'
import log from 'Utilities/log'
import { closeTrezorWindow } from 'Utilities/wallet'
import config from 'Config'
import { openWallet } from 'Actions/portfolio'
import { mockAddress } from 'Actions/mock'

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
  confVersion: '',
  seconds: CONNECT_SECONDS,
  hdKey: null,
  addressIxSelected: null
}

class HardwareWalletController extends Component {
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

    const ledgerConnect = () => {
      this.setState({ commStatus: 'connecting' })

      if (this.props.mock.mocking && Array.isArray(this.props.mock.hw) && this.props.mock.hw.includes('ledger')) {
        return window.setTimeout(() => {
          this.setState({ commStatus: 'connected', confVersion: '2.2' })
          this._getAddresses()
        }, 3000)
      }

      window.faast.hw.ledger.getAppConfiguration_async()
      .then((data) => {
        log.info(`Ledger connected, version ${data.version}`)
        this.setState({ commStatus: 'connected', confVersion: data.version })
        this._getAddresses()
      })
      .fail(() => {
        hwConnectTimerTimeout = window.setTimeout(() => {
          resetTimer()
        }, 1000)
      })
    }
    ledgerConnect()
  }

  _connectTrezor (path) {
    if (!window.faast.hw.trezor) {
      return toastr.error('Error: Trezor Connect unavailable')
    }

    const derivationPath = path || this.state.derivationPath
    this.setState({ commStatus: 'connecting' })

    if (this.props.mock.mocking && Array.isArray(this.props.mock.hw) && this.props.mock.hw.includes('trezor')) {
      return window.setTimeout(() => {
        this.setState({ commStatus: 'connected' })
        this._getAddresses(null, 0)
      }, 3000)
    }

    const trezorError = (e) => {
      log.error(e)
      toastr.error(`Error from Trezor - ${e.message}`)
      this._handleCloseModal()
    }
    try {
      window.faast.hw.trezor.getXPubKey(derivationPath, (result) => {
        if (result.success) {
          log.info('Trezor xPubKey success')
          const hdKey = new HDKey()
          hdKey.publicKey = Buffer.from(result.publicKey, 'hex')
          hdKey.chainCode = Buffer.from(result.chainCode, 'hex')
          this.setState({ hdKey, commStatus: 'connected' })
          this._getAddresses(null, 0, hdKey)
          closeTrezorWindow()
        } else {
          trezorError(new Error(result.error))
        }
      })
    } catch (e) {
      trezorError(e)
    }
  }

  _getAddresses (derPath, ixGroup, hdKey) {
    if (derPath == null) derPath = this.state.derivationPath
    if (ixGroup == null) ixGroup = this.state.addressIxGroup
    if (hdKey == null) hdKey = this.state.hdKey
    const mock = this.props.mock
    const startIndex = ixGroup * (ADDRESS_GROUP_SIZE)
    const endIndex = startIndex + (ADDRESS_GROUP_SIZE - 1)
    for (let i = startIndex; i <= endIndex; i++) {
      new Promise((resolve, reject) => {
        if (mock.mocking && mock.hw && mock.hw.length) {
          return resolve(this.props.mockAddress(derPath, i))
        }
        if (this.props.type === 'ledger') {
          window.faast.hw.ledger.getAddress_async(`${derPath}/${i}`)
          .then((result) => {
            resolve(result.address)
          })
          .fail((err) => {
            reject(err)
          })
        } else if (this.props.type === 'trezor' && hdKey) {
          const derivedKey = hdKey.derive(`m/${i}`)
          resolve('0x' + EthereumJsUtil.publicToAddress(derivedKey.publicKey, true).toString('hex'))
        } else {
          reject(new Error(`unable to get address from ${this.props.type}`))
        }
      })
      .then((address) => {
        const addresses = this.state.addresses
        addresses[i] = { address }
        this.setState({ addresses })
        window.faast.web3.eth.getBalance(address)
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
      this._getAddresses(null, newIxGroup)
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
    if (this.props.type === 'ledger') {
      this._getAddresses(path, 0)
    } else if (this.props.type === 'trezor') {
      this._connectTrezor(path)
    }
  }

  _handleChooseAddress (selected = 0) {
    const ix = this.state.addressIxGroup * ADDRESS_GROUP_SIZE + selected
    const hardwareWallet = {
      type: this.props.type,
      address: this.state.addresses[ix].address,
      derivationPath: `${this.state.derivationPath}/${ix}`
    }
    sessionStorageSet('hardwareWallet', JSON.stringify(hardwareWallet))
    this.props.openWallet('hardware', hardwareWallet, this.props.mock.mocking)
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
      <HardwareWallet
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

const mapDispatchToProps = (dispatch) => ({
  openWallet: (type, wallet, isMocking) => {
    dispatch(openWallet(type, wallet, isMocking))
  },
  mockAddress: (path, ix) => {
    return dispatch(mockAddress(path, ix))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HardwareWalletController)
