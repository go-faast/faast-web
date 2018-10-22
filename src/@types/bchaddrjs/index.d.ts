// Type definitions for bchaddrjs

/// <reference types="node" />

declare module 'bchaddrjs' {

  type AddrFormat = 'legacy' | 'bitpay' | 'cashaddr'
  type AddrNetwork = 'mainnet' | 'testnet'
  type AddrType = 'p2pkh' | 'p2sh'

  interface BchAddr {
    Format: { Legacy: 'legacy', Bitpay: 'bitpay', Cashaddr: 'cashaddr' }
    Network: { Mainnet: 'mainnet', Testnet: 'testnet' }
    Type: { P2PKH: 'p2pkh', P2SH: 'p2sh' }
    detectAddressFormat(address: string): AddrFormat
    detectAddressNetwork(address: string): AddrNetwork
    detectAddressType(address: string): AddrType
    toLegacyAddress(address: string): string
    toBitpayAddress(address: string): string
    toCashAddress(address: string): string
    isLegacyAddress(address: string): boolean
    isBitpayAddress(address: string): boolean
    isCashAddress(address: string): boolean
    isMainnetAddress(address: string): boolean
    isTestnetAddress(address: string): boolean
    isP2PKHAddress(address: string): boolean
    isP2SHAddress(address: string): boolean
    InvalidAddressError: Error
  }

  export { BchAddr as default }

}
