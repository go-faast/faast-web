import AppEth from '@ledgerhq/hw-app-eth'
import { byContractAddress } from '@ledgerhq/hw-app-eth/erc20'
import { proxy } from './util'

export default class LedgerEth {

  getAddress = proxy(AppEth, 'getAddress')
  signTransaction = proxy(AppEth, 'signTransaction')
  getAppConfiguration = proxy(AppEth, 'getAppConfiguration')
  signPersonalMessage = proxy(AppEth, 'signPersonalMessage')
  provideERC20TokenInformation = proxy(AppEth, 'provideERC20TokenInformation')

  setERC20ContractAddress(contractAddress: string): Promise<any> {
    const info = byContractAddress(contractAddress)
    if (info) {
      return this.provideERC20TokenInformation(info)
    }
    return Promise.resolve()
  }
}
