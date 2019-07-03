/// <reference types="node"/>

declare module '@ledgerhq/hw-app-eth/erc20' {
  
  export type TokenInfo = {
    contractAddress: string,
    ticker: string,
    decimals: number,
    chainId: number,
    signature: Buffer,
    data: Buffer
  }

  export function byContractAddress(contract: string): TokenInfo | undefined
  
  /**
   * list all the ERC20 tokens informations
   */
  export function list(): TokenInfo[]
}
