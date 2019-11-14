import BigNumber from 'bignumber.js'

export { BigNumber }

export interface Asset {
  symbol: string
  name: string
  decimals: number
  deposit: boolean
  receive: boolean
  cmcID: string
  iconUrl: string
  walletUrl?: string
  infoUrl?: string
  contractAddress?: string
  ERC20?: boolean
  restricted?: boolean,
  marketCap?: BigNumber,
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
  refundAddress?: string,
  depositAddressExtraId?: string,
  withdrawalAddressExtraId?: string,
  refundAddressExtraId?: string
}

export type HdAccount = {
  xpub: string, // xpub, ypub, etc
  path: string, // derivation path
}

export interface FeeRate {
  rate: BigNumber | number | string
  unit: string
}
