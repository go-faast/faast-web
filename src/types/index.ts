
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
  sendAmount: number
  sendSymbol: string
  receiveAddress: string
  receiveAmount: number
  receiveSymbol: string
  spotRate: number
  rate: number
  rateLockedAt: Date
  rateLockedUntil: Date
  amountDeposited?: number
  amountWithdrawn?: number
  backendOrderId?: string
  backendOrderState?: string
  receiveTxId?: string,
  refundAddress?: string
}
