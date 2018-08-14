import { HDNode, Network } from 'bitcoinjs-lib';
import { WorkerChannel } from './simple-worker-channel';

export type AddressSource = {
  derive(
    firstIndex: number,
    lastIndex: number
  ): Promise<Array<string>>,
};

export class BrowserAddressSource {
  network: Network;

  segwit: boolean;
  node: HDNode;

  constructor(hdnode: HDNode, network: Network, segwit: boolean)

  derive(
      first: number,
      last: number
  ): Promise<Array<string>>
}

export class WorkerAddressSource {
  channel: WorkerChannel;
  node: {
    depth: number,
    child_num: number,
    fingerprint: number,
    chain_code: Array<number>,
    public_key: Array<number>,
  };
  version: number;
  segwit: 'p2sh' | 'off';

  constructor(channel: WorkerChannel, node: HDNode, version: number, segwit: 'p2sh' | 'off')

  derive(firstIndex: number, lastIndex: number): Promise<Array<string>>
}
