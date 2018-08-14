/// <reference types="bitcoinjs-lib"/>

declare module 'coininfo' {
  export type CoinInfo = {
    toBitcoinJS(): Network
  }
  export default function(symbol: string): CoinInfo
}
