import { newScopedCreateAction } from 'Utilities/action'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { createTx, signTx, sendTx } from 'Actions/tx'

export * from 'Common/actions/app'

const createAction = newScopedCreateAction(__filename)

export const addWithdrawal = createAction('ADD_WITHDRAWAL')
export const updateWithdrawal = createAction('UPDATE_WITHDRAWAL')
export const restoreWithdrawals = createAction('RESTORE_WITHDRAWALS', (withdrawals) => withdrawals)

export const createWithdrawalTx = (walletId, address, amount, assetSymbol, options = { }) => (dispatch) => Promise.resolve()
  .then(async () => {
    const tx = await dispatch(createTx(walletId, address, amount, assetSymbol, options))
    dispatch(addWithdrawal({ 
      id: tx.id, 
      tx, 
      walletId,
      to: address, 
      amount, 
      assetSymbol, 
      createdAt: Date.now()
    }))
    return tx
  })
  .catch((e) => {
    log.error(e)
    throw new Error('Error creating withdrawal tx: ' + e.message)
  })

export const signAndSubmitTx = (tx, passwordCache = {}, sendOptions) => (dispatch) => Promise.resolve()
  .then(async () => {
    const newTx = await dispatch(signTx(tx, passwordCache))
    const sentTx = await dispatch(sendTx(newTx, sendOptions))
    if (sentTx) {
      dispatch(updateWithdrawal({
        id: sentTx.id,
        tx: sentTx,
        sent: sentTx.sent,
        hash: sentTx.hash,
        sentAt: Date.now()
      }))
      toastr.success('Transaction successfully sent!')
      return sentTx
    }
  })
  .catch((e) => {
    log.error(e)
    throw new Error('Error: ' + e.message)
  })
