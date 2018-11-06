import BigNumber from 'bignumber.js'

export interface Asset {
  symbol: string
  name: string
  decimals: number
  contractAddress?: string
  ERC20?: boolean
}

export interface SwapOrder {
  orderId: string
  orderStatus: string
  createdAt: Date
  updatedAt: Date
  depositAddress: string
  sendWalletId: string
  depositAmount: BigNumber
  sendSymbol: string
  receiveAddress: string
  receiveAmount: BigNumber
  receiveSymbol: string
  spotRate: BigNumber
  rate: BigNumber
  rateLockedAt: Date
  rateLockedUntil: Date
  amountDeposited?: BigNumber
  amountWithdrawn?: BigNumber
  backendOrderId?: string
  backendOrderState?: string
  receiveTxId?: string,
  refundAddress?: string
}

export type HdAccount = {
  xpub: string, // xpub, ypub, etc
  path: string, // derivation path
}
