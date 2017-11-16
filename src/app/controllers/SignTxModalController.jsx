import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import SignTxModal from 'Views/SignTxModal'
import { getPrivateKeyString, closeTrezorWindow } from 'Utilities/wallet'
import { toTxFee, toUnit, toPrecision } from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus } from 'Utilities/swap'
import { signTransactions, sendSignedTransactions } from 'Actions/portfolio'

class SignTxModalController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      view: props.view || (props.wallet.hasOwnProperty('hw') ? 'hardwareWallet' : 'keystorePassword'),
      isSigning: false
    }
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleKeystorePassword = this._handleKeystorePassword.bind(this)
    this._handleSignHardwareWallet = this._handleSignHardwareWallet.bind(this)
  }

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState({ isSigning: false })
    this.props.toggleModal()
  }

  _handleKeystorePassword (values, dispatch) {
    if (!values.password) return toastr.error('Enter your wallet password to sign the transactions')

    const wallet = this.props.wallet
    const isMocking = this.props.mock.mocking

    return new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        getPrivateKeyString(wallet.encrypted, values.password, isMocking)
        .then(resolve)
        .catch((e) => {
          toastr.error('Unable to decrypt wallet. Wrong password?')
          reject(e)
        })
      })
      .then((pk) => {
        return new Promise((resolve, reject) => {
          dispatch(signTransactions(this.props.swap, wallet, pk, isMocking))
          .then(resolve)
          .catch((e) => {
            toastr.error('Unable to sign transactions')
            reject(e)
          })
        })
      })
      .then((result) => {
        dispatch(sendSignedTransactions(this.props.swap, isMocking))
        resolve()
      })
      .catch(reject)
    })
    .then(() => {
      // this.setState({ view: 'orderStatus' })
      dispatch(push('/balances'))
    })
    .catch(log.error)
    // this.props.toggleModal()
  }

  _handleSignHardwareWallet (values, dispatch) {
    const wallet = this.props.wallet
    const isMocking = this.props.mock.mocking

    this.setState({ isSigning: true })

    return new Promise((resolve, reject) => {
      dispatch(signTransactions(this.props.swap, wallet, null, isMocking))
      .then((result) => {
        if (!this.props.showModal) throw new Error('modal closed')
        closeTrezorWindow()
        dispatch(sendSignedTransactions(this.props.swap, isMocking))
        resolve()
      })
      .catch(reject)
    })
    .then(() => {
      if (!this.props.showModal) throw new Error('modal closed')
      dispatch(push('/balances'))
    })
    .catch((e) => {
      log.error(e)
      this._handleCloseModal()
    })
  }

  render () {
    const readyToSign = () => {
      const hasError = this.props.swap.some((a) => {
        return a.list.some((b) => b.errors && b.errors.length)
      })
      const statuses = this.props.swap.reduce((a, b) => {
        return a.concat(b.list.map(getSwapStatus).map(c => c.details))
      }, [])
      return !hasError && statuses.every(s => s === 'waiting for transaction to be signed')
    }
    const estimateTxFee = (a) => {
      if (a.tx && a.tx.hasOwnProperty('gasLimit') && a.tx.hasOwnProperty('gasPrice')) {
        return toTxFee(a.tx.gasLimit, a.tx.gasPrice)
      }
    }
    const calculateReceiveAmount = (a, b) => {
      if (a.hasOwnProperty('fee') && a.hasOwnProperty('rate') && a.hasOwnProperty('unit')) {
        const converted = toUnit(a.unit, a.rate, b.decimals)
        return toPrecision(converted.minus(a.fee), b.decimals)
      }
    }
    const getStatus = (a) => {
      const status = getSwapStatus(a)
      if (status.status === 'error') {
        return {
          cl: 'failed',
          text: 'failed',
          details: status.details
        }
      }
      if (status.status === 'working') {
        return {
          cl: 'in-progress',
          text: 'in progress',
          details: status.details
        }
      }
      return {
        cl: 'done',
        text: 'done'
      }
    }
    const getError = (a) => {
      if (a.errors && Array.isArray(a.errors) && a.errors.length) {
        const eKeys = a.errors.map(e => Object.keys(e)[0])
        if (eKeys.includes('swapMarketInfo')) {
          const error = Object.values(a.errors.find(e => Object.keys(e)[0] === 'swapMarketInfo'))[0]
          if (error.message && error.message.startsWith('minimum')) return error.message
          if (error.message && error.message.startsWith('maximum')) return error.message
        }
        if (eKeys.includes('swapMarketInfo') || eKeys.includes('swapPostExchange')) {
          return 'swap unavailable at this time'
        }
        // if (eKeys.includes('swapEstimateTxFee')) {
        //   return 'web3 communication error'
        // }
        if (eKeys.includes('swapSufficientDeposit')) {
          return 'estimated amount to receive is below 0'
        }
        if (eKeys.includes('swapSufficientEther')) {
          return 'insufficient ETH for txn fee'
        }
        return 'unknown error'
      }
    }
    const portfolio = this.props.portfolio
    const swapList = this.props.swap.reduce((a, b) => {
      if (!portfolio.list.length) return []
      return a.concat(b.list.map((c) => {
        const from = portfolio.list.find(d => d.symbol === b.symbol)
        const to = portfolio.list.find(d => d.symbol === c.symbol)
        return {
          from,
          to,
          pair: `${b.symbol}_${c.symbol}`,
          swap: c,
          txFee: estimateTxFee(c),
          receiveAmount: calculateReceiveAmount(c, to),
          status: getStatus(c),
          error: getError(c)
        }
      }))
    }, [])
    return (
      <SignTxModal
        view={this.state.view}
        showModal={this.props.showModal}
        handleCloseModal={this._handleCloseModal}
        handleKeystorePassword={this._handleKeystorePassword}
        handleSignHardwareWallet={this._handleSignHardwareWallet}
        swapList={swapList}
        readyToSign={readyToSign()}
        isSigning={this.state.isSigning}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio,
  swap: state.swap,
  wallet: state.wallet,
  mock: state.mock
})

export default connect(mapStateToProps)(SignTxModalController)
