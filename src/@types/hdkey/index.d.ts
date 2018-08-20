/// <reference types="node"/>

declare module 'hdkey' {
  export default class HDNode {
    static fromMasterSeed(seed: Buffer, versions?: object): HDNode;
    static fromExtendedKey(extendedKey: string, versions?: object): HDNode;
    static fromJSON(obj: object): HDNode;
    publicKey: Buffer;
    privateKey: Buffer;
    chainCode: Buffer;
    privateKey: Buffer;
    publicKey: Buffer;
    readonly privateExtendedKey: string | null;
    readonly publicExtendedKey: string;
    constructor();
    derive(path: string): HDNode;
    deriveChild(index: number): HDNode;
    sign(hash: Buffer): Buffer;
    verify(hash: Buffer, signature: Buffer): boolean;
    wipePrivateData(): void;
    toJSON(): object;
  }
}
