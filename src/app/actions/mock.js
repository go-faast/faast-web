import log from 'Utilities/log'
import { generateWallet } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import { insertSwapData, updateSwapTx, updateSwapOrder } from 'Actions/redux'

let addresses = []

export const mockTransaction = (send, receive) => (dispatch) => {
  window.setTimeout(() => {
    dispatch(insertSwapData(send.symbol, receive.symbol, { txHash: '0x123456' }))
    dispatch(mockPollTransactionReceipt(send, receive))
  }, 2000)
}

export const mockPollTransactionReceipt = (send, receive) => (dispatch) => {
  window.setTimeout(() => {
    const receipt = { mock: true }
    log.info('mock tx receipt obtained')
    dispatch(updateSwapTx(send.symbol, receive.symbol, { receipt }))
    dispatch(mockPollOrderStatus(send, receive))
  }, 3000)
}

export const mockPollOrderStatus = (send, receive) => (dispatch) => {
  let orderStatusInterval
  let status
  orderStatusInterval = window.setInterval(() => {
    status = mockOrderStatus(status)
    console.log(status)
    if (status.status === 'complete') window.clearInterval(orderStatusInterval)
    dispatch(updateSwapOrder(send.symbol, receive.symbol, {
      status: status.status,
      transaction: status.transaction
    }))
  }, 10000)
}

const mockOrderStatus = (prevStatus) => {
  if (!prevStatus) {
    return { status: 'no_deposits', mockCounter: 1 }
  }
  const rand = (c) => (
    Math.floor(Math.random() * 10) + c
  )
  const incrCounter = (status) => {
    return Object.assign({}, status, { mockCounter: status.mockCounter + 1 })
  }
  switch (prevStatus.status) {
  case 'no_deposits':
    if (rand(prevStatus.mockCounter) > 4) {
      return { status: 'received', mockCounter: 1 }
    }
    return incrCounter(prevStatus)
  case 'received':
    if (rand(prevStatus.mockCounter) > 7) {
      return { status: 'complete', transaction: 'mock123', mockCounter: 1 }
    }
    return incrCounter(prevStatus)
  default:
    return prevStatus
  }
}

export const mockAddress = (path = 'm', ix = 0) => () => {
  let wallet
  if (addresses[path] && addresses[path][ix]) {
    wallet = addresses[path][ix]
  } else {
    wallet = generateWallet()
    if (!addresses[path]) addresses[path] = []
    addresses[path][ix] = wallet
  }
  return wallet.getChecksumAddressString()
}

export const mockHardwareWalletSign = (type) => {
  return new Promise((resolve, reject) => {
    let timesApproved = 0
    const highlightStyles = 'background: black; color: yellow;'
    if (type === 'trezor') {
      console.log('=====================')
      console.log('Mocking Trezor Wallet')
      console.log('=====================')
      console.log('Popup window will appear saying the following:')
      console.log('%c Check recipient address on your device and follow further instructions.', highlightStyles)
      console.log('On the Trezor, the following text will say something like:')
      console.log('%c Send 5.74363634636 CVC to 0x196baaccddddb4fb9ac92efc099160cbeb41e138', highlightStyles)
      console.log('(actual values will vary)')
      console.log('Options are "Cancel" and "Confirm". User will press either of these buttons.')
      console.log('To mock "Cancel", press the "c" key. To mock "Confirm", press the "a" key')
    } else if (type === 'ledger') {
      console.log('=====================')
      console.log('Mocking Ledger Wallet')
      console.log('=====================')
      console.log('On the Ledger, the following text will say something like:')
      console.log('%c Confirm transaction', highlightStyles)
      console.log('%c Amount: CVC 5.74363634636', highlightStyles)
      console.log('%c Address: 0x196baaccddddb4fb9ac92efc099160cbeb41e138', highlightStyles)
      console.log('%c Maximum fees: ETH 0.0010343', highlightStyles)
      console.log('(actual values will vary)')
      console.log('Options are "✕" and "✔". User will press either of these buttons.')
      console.log('To mock "✕", press the "c" key. To mock "✔", press the "a" key')
    }
    const confirmFirst = () => {
      console.log('=====================')
      console.log('The Trezor will then say something like:')
      console.log('%c Really send token paying up to 0.0010343 ETH for gas', highlightStyles)
      console.log('(actual values will vary)')
      console.log('Options are "Cancel" and "Confirm". User will press either of these buttons.')
      console.log('To mock "Cancel", press the "c" key. To mock "Confirm", press the "a" key')
      document.addEventListener('keydown', keydownEvent)
    }
    const keydownEvent = (event) => {
      // approve if the key 'a' is pressed
      // cancel if the key 'c' is pressed
      console.log('Key pressed:', event.keyCode)
      if (event.keyCode === 65) {
        timesApproved += 1
        document.removeEventListener('keydown', keydownEvent)
        if (type === 'trezor' && timesApproved <= 1) {
          confirmFirst()
        } else {
          resolve('mock_signed_hw_456')
        }
      } else if (event.keyCode === 67) {
        document.removeEventListener('keydown', keydownEvent)
        toastr.error('Transaction was denied')
        reject(new Error('transaction cancelled'))
      }
    }
    document.addEventListener('keydown', keydownEvent)
  })
}
