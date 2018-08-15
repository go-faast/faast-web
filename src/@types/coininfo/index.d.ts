/// <reference types="bitcoinjs-lib"/>

declare module 'coininfo' {
  type BitcoinJsNetwork = Network & {
    messagePrefix: string | null,
  }
  export type CoinInfo = {
    toBitcoinJS(): BitcoinJsNetwork
  }
  export default function(symbol: string): CoinInfo
}
