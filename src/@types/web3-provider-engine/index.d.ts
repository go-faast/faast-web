declare module 'web3-provider-engine' {

  namespace Web3ProviderEngine {
    export interface ProviderOpts {
      static?: {
        eth_syncing?: boolean
        web3_clientVersion?: string
      }
      rpcUrl?: string
      getAccounts?: (error: any, accounts?: Array<string>) => void
      approveTransaction?: Function
      signTransaction?: Function
      signMessage?: Function
      processTransaction?: Function
      processMessage?: Function
      processPersonalMessage?: Function
    }
    export interface Payload {
      method: string
    }
  }

  class Web3ProviderEngine {
    on(event: string, handler: Function): void;
    send(payload: Web3ProviderEngine.Payload): void;
    sendAsync(payload: Web3ProviderEngine.Payload, callback: (error: any, response: any) => void): void;
    addProvider(provider: any): void;
    start(): void;
    stop(): void;
  }

  export = Web3ProviderEngine
}

declare module 'web3-provider-engine/subproviders/subprovider' {
  import * as Web3ProviderEngine from 'web3-provider-engine'

  class Subprovider {
    setEngine(engine: Web3ProviderEngine): void
    handleRequest(payload: Web3ProviderEngine.Payload, next: Subprovider.NextCb, end: Subprovider.EndCb): any
    emitPayload(payload: Web3ProviderEngine.Payload, cb: () => any): void
  }

  namespace Subprovider {
    type NextCb = (cb?: (err?: any, response?: any, cb?: () => any) => any) => any
    type EndCb = (err?: any, response?: any) => any
  }

  export = Subprovider
}

declare module 'web3-provider-engine/zero' {
  import * as Web3ProviderEngine from 'web3-provider-engine'

  function ZeroClientProvider(opts: Web3ProviderEngine.ProviderOpts): Web3ProviderEngine

  namespace ZeroClientProvider {
  }

  export = ZeroClientProvider
}

declare module 'web3-provider-engine/subproviders/filters' {
  import Subprovider from 'web3-provider-engine/subproviders/subprovider'

  class FiltersSubprovider extends Subprovider {

  }

  namespace FiltersSubprovider {

  }

  export = FiltersSubprovider
}

declare module 'web3-provider-engine/subproviders/hooked-wallet' {
  import Subprovider from 'web3-provider-engine/subproviders/subprovider'
  import { Tx, Transaction } from 'web3/eth/types'

  class HookedWalletSubprovider extends Subprovider {
    constructor(opts?: HookedWalletSubprovider.Options)
  }

  namespace HookedWalletSubprovider {
    type Address = string
    type HexString = string
    export type Callback<A> = (err: Error|null|undefined, result?: A) => void
    export type Function1<A, B> = (a: A, callback: Callback<B>) => void
    export type MsgParams = { from: Address, data: HexString }
    export type TypedMsgParams = { from: Address, data: object }
    export type RecoveryParams = { sig: HexString, data: HexString }

    export interface Options {
      signTransaction: Function1<Tx, Transaction>
      signMessage: Function1<MsgParams, HexString>
      signPersonalMessage: Function1<MsgParams, HexString>
      signTypedMessage: Function1<TypedMsgParams, HexString>

      getAccounts?: (callback: Callback<Array<string>>) => void
      processTransaction?: Function1<Tx, HexString>
      processMessage?: Function1<MsgParams, HexString>
      processPersonalMessage?: Function1<MsgParams, HexString>
      processTypedMessage?: Function1<TypedMsgParams, HexString>
      approveTransaction?: Function1<Tx, boolean>
      approveMessage?: Function1<MsgParams, boolean>
      approvePersonalMessage?: Function1<MsgParams, boolean>
      approveTypedMessage?: Function1<TypedMsgParams, boolean>
      recoverPersonalSignature?: Function1<RecoveryParams, Address>
      publishTransaction?: Function1<HexString, HexString>
    }
  }

  export = HookedWalletSubprovider
}

declare module 'web3-provider-engine/subproviders/provider' {
  import Subprovider from 'web3-provider-engine/subproviders/subprovider'
  import { Provider } from 'web3/providers'

  class ProviderSubprovider extends Subprovider {
    constructor (provider: Provider)
  }

  namespace ProviderSubprovider {

  }

  export = ProviderSubprovider
}
