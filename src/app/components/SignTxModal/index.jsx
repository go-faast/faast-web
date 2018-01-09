import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import SignTxModalView from './view'
import { closeTrezorWindow } from 'Utilities/wallet'
import { toTxFee } from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus, estimateReceiveAmount } from 'Utilities/swap'
import { sendSwapDeposits, signTransactions, sendSignedTransactions, sendTransactions } from 'Actions/portfolio'

class SignTxModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      view: props.view || props.wallet.type,
      isSigning: false
    }
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleKeystorePassword = this._handleKeystorePassword.bind(this)
    this._handleSignHardwareWallet = this._handleSignHardwareWallet.bind(this)
    this._handleMetaMask = this._handleMetaMask.bind(this)
  }

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState({ isSigning: false })
    this.props.toggleModal()
  }

  _handleKeystorePassword (values, dispatch) {
    if (this.state.view === 'EthereumWalletKeystore' && !values.password) {
      return toastr.error('Enter your wallet password to sign the transactions')
    }

    const { swap, mock } = this.props
    const isMocking = mock.mocking
    console.log(swap)
    return dispatch(sendSwapDeposits(swap, { password: values.password }, isMocking))
      .then(() => {
        dispatch(push('/balances'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
      })
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

  _handleMetaMask (values, dispatch) {
    const isMocking = this.props.mock.mocking

    this.setState({ isSigning: true })

    return dispatch(sendTransactions(this.props.swap, isMocking))
    .then((result) => {
      dispatch(push('/balances'))
    })
    .catch((e) => {
      log.error(e)
      this._handleCloseModal()
    })
  }

  _handleBlockstack (values, dispatch) {

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
          receiveAmount: estimateReceiveAmount(c, to),
          status: getStatus(c),
          error: getError(c)
        }
      }))
    }, [])
    return (
      <SignTxModalView
        showModal={this.props.showModal}
        view={this.state.view}
        handleKeystorePassword={this._handleKeystorePassword}
        handleSignHardwareWallet={this._handleSignHardwareWallet}
        handleMetaMask={this._handleMetaMask}
        mq={this.props.mq}
        signTxProps={{
          readyToSign: readyToSign(),
          handleCancel: this._handleCloseModal,
          isSigning: this.state.isSigning,
          swapList: swapList,
          type: this.state.view
        }}
        orderStatusProps={{
          swapList: swapList,
          handleClose: this._handleCloseModal
        }}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio,
  swap: state.swap,
  wallet: state.wallet,
  mock: state.mock,
  mq: state.mediaQueries
})

export default connect(mapStateToProps)(SignTxModal)
