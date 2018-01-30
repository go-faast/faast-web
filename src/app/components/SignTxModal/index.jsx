import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import SignTxModalView from './view'
import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus, estimateReceiveAmount } from 'Utilities/swap'
import { sendSwapDeposits } from 'Actions/portfolio'
import { getCurrentPortfolio, getCurrentWallet } from 'Selectors'

class SignTxModal extends Component {
  constructor (props) {
    super(props)
    const { view, wallet } = props
    this.state = {
      view: view || (wallet.isBlockstack ? 'blockstack' : wallet.type),
      isSigning: false
    }
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState({ isSigning: false })
    this.props.toggleModal()
  }

  _handleSubmit (values, dispatch) {
    if (this.state.view === 'EthereumWalletKeystore' && !values.password) {
      return toastr.error('Enter your wallet password to sign the transactions')
    }
    this.setState({ isSigning: true })

    const { swap, mock: { mocking: isMocking } } = this.props
    console.log(swap)
    return dispatch(sendSwapDeposits(swap, { password: values.password }, isMocking))
      .then(() => {
        if (!this.props.showModal) throw new Error('modal closed')
        closeTrezorWindow()
        this.setState({ isSigning: false })
        dispatch(push('/balances'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
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
    const estimateTxFee = ({ tx }) => {
      if (tx) {
        return tx.feeAmount
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
        signTxProps={{
          readyToSign: readyToSign(),
          onSubmit: this._handleSubmit,
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
  portfolio: getCurrentPortfolio(state),
  swap: state.swap,
  wallet: getCurrentWallet(state),
  mock: state.mock
})

export default connect(mapStateToProps)(SignTxModal)
