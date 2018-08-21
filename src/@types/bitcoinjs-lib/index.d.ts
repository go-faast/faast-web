// Type definitions for bitcoinjs-lib 4.0
//
// based on the 3.4 version found at:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/29db44ccae429452e304f3b508f6856f9100440c/types/bitcoinjs-lib/index.d.ts
// and changelog found at:
// https://github.com/bitcoinjs/bitcoinjs-lib/blob/v4.0.1/CHANGELOG.md

/// <reference types="node" />

declare module 'bitcoinjs-lib' {

  export interface Out {
    script: Buffer;
    value: number;
  }

  export interface In {
    script: Buffer;
    hash: Buffer;
    index: number;
    sequence: number;
    witness: Buffer[];
  }

  export interface Network {
    bech32?: string;
    bip32: {
      public: number;
      private: number;
    };
    messagePrefix: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
  }

  export class Block {
    constructor();

    byteLength(headersOnly?: boolean): number;

    checkMerkleRoot(): any;

    checkProofOfWork(): any;

    getHash(): Buffer;

    getId(): string;

    getUTCDate(): any;

    toBuffer(headersOnly?: boolean): Buffer;

    toHex(headersOnly?: boolean): string;

    static calculateMerkleRoot(transactions: Transaction[] | Array<{ getHash(): Buffer; }>): Buffer;

    static calculateTarget(bits: number): Buffer;

    static fromBuffer(buffer: Buffer): Block;

    static fromHex(hex: string): Block;
  }

  export class ECPair {
    d: string;

    readonly compressed: boolean;

    readonly network: Network;

    readonly publicKey: string;

    readonly privateKey: string;

    sign(hash: Buffer): Buffer;

    toWIF(): string;

    verify(hash: Buffer, signature: Buffer): boolean;

    static fromPublicKey(buffer: Buffer, network: Network): ECPair;

    static fromPrivateKey(buffer: Buffer, network: Network): ECPair;

    static fromWIF(string: string, network?: Network): ECPair;

    static makeRandom(options?: { compressed?: boolean, network?: Network, rng?: Rng }): ECPair;
  }

  export type Rng = (size: number) => Buffer;

  export class bip32 {
    constructor(keyPair: ECPair, chainCode: Buffer);

    keyPair: ECPair;

    derive(index: number): bip32;

    deriveHardened(index: number): bip32;

    derivePath(path: string): bip32;

    getAddress(): string;

    getFingerprint(): Buffer;

    getIdentifier(): Buffer;

    getNetwork(): Network;

    getPublicKeyBuffer(): Buffer;

    isNeutered(): boolean;

    neutered(): bip32;

    sign(hash: Buffer): Buffer;

    toBase58(): string;

    verify(hash: Buffer, signature: Buffer): boolean;

    static HIGHEST_BIT: number;

    static LENGTH: number;

    static fromBase58(string: string, networks?: Network[] | Network): bip32;

    static fromSeedBuffer(seed: Buffer, network?: Network): bip32;

    static fromSeedHex(hex: string, network?: Network): bip32;

    static MASTER_SECRET: Buffer;
  }

  export class Transaction {
    version: number;
    locktime: number;
    ins: In[];
    outs: Out[];
    constructor();

    addInput(hash: Buffer, index: number, sequence?: number, scriptSig?: Buffer): number;

    addOutput(scriptPubKey: Buffer | string, value: number): number;

    byteLength(): number;

    clone(): Transaction;

    getHash(): Buffer;

    getId(): string;

    /** @since 3.0.0 */
    hasWitnesses(): boolean;

    hashForSignature(inIndex: number, prevOutScript: Buffer, hashType: number): Buffer;

    /** @since 3.0.0 */
    hashForWitnessV0(inIndex: number, prevOutScript: Buffer, value: number, hashType: number): Buffer;

    isCoinbase(): boolean;

    setInputScript(index: number, scriptSig: Buffer): void;

    /** @since 3.0.0 */
    setWitness(index: number, witness: any, ...args: any[]): void;

    /** @since 3.0.0 */
    toBuffer(buffer?: Buffer, initialOffset?: number): Buffer;

    toHex(): string;

    /** @since 3.1.0 */
    virtualSize(): number;

    /** @since 3.1.0 */
    weight(): number;

    static ADVANCED_TRANSACTION_FLAG: number;

    static ADVANCED_TRANSACTION_MARKER: number;

    static DEFAULT_SEQUENCE: number;

    static SIGHASH_ALL: number;

    static SIGHASH_ANYONECANPAY: number;

    static SIGHASH_NONE: number;

    static SIGHASH_SINGLE: number;

    static fromBuffer(buffer: Buffer, __noStrict?: boolean): Transaction;

    static fromHex(hex: string): Transaction;

    static isCoinbaseHash(buffer: Buffer): boolean;
  }

  export interface Input {
    pubKeys: Buffer[];
    signatures: Buffer[];
    prevOutScript: Buffer;
    prevOutType: string;
    signType: string;
    signScript: Buffer;
    witness: boolean;
  }

  export class TransactionBuilder {

    constructor(network?: Network, maximumFeeRate?: number);

    addInput(txhash: Buffer | string | Transaction, vout: number, sequence?: number, prevOutScript?: Buffer): number;

    addOutput(scriptPubKey: Buffer | string, value: number): number;

    build(): Transaction;

    buildIncomplete(): Transaction;

    setLockTime(locktime: number): void;

    setVersion(version: number): void;

    /** @since 3.0.0 */
    sign(vin: number, keyPair: ECPair, redeemScript?: Buffer, hashType?: number, witnessValue?: number, witnessScript?: Buffer): void;

    static fromTransaction(transaction: Transaction, network: Network): TransactionBuilder;
  }

  export const networks: {
    bitcoin: Network;
    testnet: Network;
  };

  export const opcodes: {
    OP_0: number;
    OP_0NOTEQUAL: number;
    OP_1: number;
    OP_10: number;
    OP_11: number;
    OP_12: number;
    OP_13: number;
    OP_14: number;
    OP_15: number;
    OP_16: number;
    OP_1ADD: number;
    OP_1NEGATE: number;
    OP_1SUB: number;
    OP_2: number;
    OP_2DIV: number;
    OP_2DROP: number;
    OP_2DUP: number;
    OP_2MUL: number;
    OP_2OVER: number;
    OP_2ROT: number;
    OP_2SWAP: number;
    OP_3: number;
    OP_3DUP: number;
    OP_4: number;
    OP_5: number;
    OP_6: number;
    OP_7: number;
    OP_8: number;
    OP_9: number;
    OP_ABS: number;
    OP_ADD: number;
    OP_AND: number;
    OP_BOOLAND: number;
    OP_BOOLOR: number;
    OP_CAT: number;
    OP_CHECKLOCKTIMEVERIFY: number;
    OP_CHECKMULTISIG: number;
    OP_CHECKMULTISIGVERIFY: number;
    OP_CHECKSIG: number;
    OP_CHECKSIGVERIFY: number;
    OP_CODESEPARATOR: number;
    OP_DEPTH: number;
    OP_DIV: number;
    OP_DROP: number;
    OP_DUP: number;
    OP_ELSE: number;
    OP_ENDIF: number;
    OP_EQUAL: number;
    OP_EQUALVERIFY: number;
    OP_FALSE: number;
    OP_FROMALTSTACK: number;
    OP_GREATERTHAN: number;
    OP_GREATERTHANOREQUAL: number;
    OP_HASH160: number;
    OP_HASH256: number;
    OP_IF: number;
    OP_IFDUP: number;
    OP_INVALIDOPCODE: number;
    OP_INVERT: number;
    OP_LEFT: number;
    OP_LESSTHAN: number;
    OP_LESSTHANOREQUAL: number;
    OP_LSHIFT: number;
    OP_MAX: number;
    OP_MIN: number;
    OP_MOD: number;
    OP_MUL: number;
    OP_NEGATE: number;
    OP_NIP: number;
    OP_NOP: number;
    OP_NOP1: number;
    OP_NOP10: number;
    OP_NOP2: number;
    OP_NOP3: number;
    OP_NOP4: number;
    OP_NOP5: number;
    OP_NOP6: number;
    OP_NOP7: number;
    OP_NOP8: number;
    OP_NOP9: number;
    OP_NOT: number;
    OP_NOTIF: number;
    OP_NUMEQUAL: number;
    OP_NUMEQUALVERIFY: number;
    OP_NUMNOTEQUAL: number;
    OP_OR: number;
    OP_OVER: number;
    OP_PICK: number;
    OP_PUBKEY: number;
    OP_PUBKEYHASH: number;
    OP_PUSHDATA1: number;
    OP_PUSHDATA2: number;
    OP_PUSHDATA4: number;
    OP_RESERVED: number;
    OP_RESERVED1: number;
    OP_RESERVED2: number;
    OP_RETURN: number;
    OP_RIGHT: number;
    OP_RIPEMD160: number;
    OP_ROLL: number;
    OP_ROT: number;
    OP_RSHIFT: number;
    OP_SHA1: number;
    OP_SHA256: number;
    OP_SIZE: number;
    OP_SUB: number;
    OP_SUBSTR: number;
    OP_SWAP: number;
    OP_TOALTSTACK: number;
    OP_TRUE: number;
    OP_TUCK: number;
    OP_VER: number;
    OP_VERIF: number;
    OP_VERIFY: number;
    OP_VERNOTIF: number;
    OP_WITHIN: number;
    OP_XOR: number;
  };

  export namespace address {
    function fromBase58Check(address: string): { hash: Buffer, version: number };

    /** @since 3.2.0 */
    function fromBech32(address: string): { data: Buffer, prefix: string, version: number };

    function fromOutputScript(outputScript: Buffer, network?: Network): string;

    function toBase58Check(hash: Buffer, version: number): string;

    /** @since 3.2.0 */
    function toBech32(data: Buffer, version: number, prefix: string): string;

    function toOutputScript(address: string, network?: Network): Buffer;
  }

  export namespace payments {

    type MaybeNetwork = {
      network?: Network
    }

    type WithNetwork = {
      network: Network
    }

    type WithWitness = {
      witness?: Buffer[]
    }

    type WithAddressHash = {
      hash?: Buffer,
      address?: string
    }

    type WithInputOutput = {
      input?: Buffer,
      output?: Buffer
    }

    type PaymentOpts = {
      validate?: boolean
    }

    type PaymentEmbed = {
      output?: Buffer,
      data?: Buffer[]
    }

    type PaymentP2ms = WithInputOutput & {
      m?: number,
      n?: number,
      signatures?: Buffer[],
      pubkeys?: Buffer[]
    }

    type PaymentPk = WithInputOutput & {
      pubkey?: Buffer,
      signature?: Buffer
    }

    type PaymentP2pkh = PaymentPk & WithAddressHash

    type PaymentRedeem = WithInputOutput & WithWitness & MaybeNetwork

    type PaymentP2sh = WithInputOutput & WithWitness & WithAddressHash & {
      redeem?: PaymentRedeem
    }

    type PaymentP2wpkh = PaymentPk & WithWitness & WithAddressHash

    type PaymentP2wsh = PaymentP2sh

    function embed(
      a: PaymentEmbed & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentEmbed & WithNetwork;
    function p2ms(
      a: PaymentP2ms & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentP2ms & WithNetwork & WithWitness;
    function p2pk(
      a: PaymentPk & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentPk & WithNetwork & WithWitness;
    function p2pkh(
      a: PaymentP2pkh & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentP2pkh & WithNetwork & WithWitness;
    function p2sh(
      a: PaymentP2sh & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentP2sh & WithNetwork;
    function p2wpkh(
      a: PaymentP2wpkh & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentP2wpkh & WithNetwork;
    function p2wsh(
      a: PaymentP2wsh & MaybeNetwork,
      opts?: PaymentOpts
    ): PaymentP2wsh & WithNetwork;
  }

  export namespace crypto {
    function hash160(buffer: Buffer): Buffer;

    function hash256(buffer: Buffer): Buffer;

    function ripemd160(buffer: Buffer): Buffer;

    function sha1(buffer: Buffer): Buffer;

    function sha256(buffer: Buffer): Buffer;
  }

  export namespace script {
    function classifyInput(script: Buffer | Array<Buffer | number>, allowIncomplete?: boolean): "pubkeyhash" | "scripthash" | "multisig" | "pubkey" | "nonstandard";

    function classifyOutput(script: Buffer | Array<Buffer | number>): "witnesspubkeyhash" | "witnessscripthash" | "pubkeyhash"
      | "scripthash" | "multisig" | "pubkey" | "witnesscommitment" | "nulldata" | "nonstandard";

    function classifyWitness(script: Buffer | Array<Buffer | number>, allowIncomplete: boolean): "witnesspubkeyhash" | "witnessscripthash" | "nonstandard";

    function compile(chunks: Array<Buffer | number>): Buffer;

    function decompile(buffer: Buffer): Array<Buffer | number>;

    function fromASM(asm: string): Buffer;

    function isCanonicalPubKey(buffer: Buffer): boolean;

    function isCanonicalScriptSignature(buffer: Buffer): boolean;

    function isDefinedHashType(hashType: any): boolean;

    function isPushOnly(value: any): boolean;

    function toASM(chunks: Buffer | Array<Buffer | number>): string;

    function toStack(chunks: Buffer | Array<Buffer | number>): Buffer[];

    namespace number {
      function decode(buffer: Buffer, maxLength: number, minimal: boolean): number;

      function encode(number: number): Buffer;
    }

    const multisig: {
      input: {
        decode(buffer: Buffer): Array<Buffer | number>;
        decodeStack(stack: Buffer[], allowIncomplete: boolean): Array<Buffer | number>;
        encode(signatures: Buffer[], scriptPubKey: Buffer): Buffer;
        encodeStack(signatures: Buffer[], scriptPubKey: Buffer): Buffer[];
      };
      output: {
        decode(buffer: Buffer, allowIncomplete: boolean): { m: number; pubKeys: Array<Buffer | number> };
        encode(m: number, pubKeys: Array<Buffer | number>): Buffer;
      };
    };

    const pubKey: {
      input: {
        decode(buffer: Buffer): Array<Buffer | number>;
        decodeStack(stack: Buffer[]): Array<Buffer | number>;
        encode(signature: Buffer): Buffer;
        encodeStack(signature: Buffer): Buffer[];
      };

      output: {
        decode(buffer: Buffer): Buffer | number;
        encode(pubKey: Buffer): Buffer;
      };
    };

    const pubKeyHash: {
      input: {
        decode(buffer: Buffer): { signature: Buffer; pubKey: Buffer };
        decodeStack(stack: Buffer[]): { signature: Buffer; pubKey: Buffer };
        encode(signature: Buffer, pubKey: Buffer): Buffer;
        encodeStack(signature: Buffer, pubKey: Buffer): [Buffer, Buffer];
      };

      output: {
        decode(buffer: Buffer): Buffer;
        encode(pubKeyHash: Buffer): Buffer;
      };
    };

    const scriptHash: {
      input: {
        decode(buffer: Buffer): { redeemScriptStack: Buffer[]; redeemScript: Buffer };
        decodeStack(stack: Buffer[]): { redeemScriptStack: Buffer[]; redeemScript: Buffer };
        encode(redeemScriptSig: Array<Buffer | number>, redeemScript: Buffer): Buffer;
        encodeStack(redeemScriptStack: Buffer[], redeemScript: Buffer): Buffer[];
      };

      output: {
        decode(buffer: Buffer): Buffer;
        encode(scriptHash: Buffer): Buffer;
      };
    };

    const witnessCommitment: {
      output: {
        decode(buffer: Buffer): Buffer[];
        encode(commitment: Buffer): Buffer;
      };
    };

    const witnessPubKeyHash: {
      input: {
        decodeStack(stack: Buffer[]): { signature: Buffer; pubKey: Buffer };
        encodeStack(signature: Buffer, pubKey: Buffer): [Buffer, Buffer];
      };

      output: {
        decode(buffer: Buffer): Buffer;
        encode(pubKeyHash: Buffer): Buffer;
      };
    };

    const witnessScriptHash: {
      input: {
        decodeStack(stack: Buffer[]): { redeemScriptStack: Buffer[]; redeemScript: Buffer };
        encodeStack(redeemScriptStack: Buffer[], redeemScript: Buffer): Buffer[];
      };

      output: {
        decode(buffer: Buffer): Buffer;
        encode(scriptHash: Buffer): Buffer;
      };
    };

    const nullData: {
      output: {
        decode(buffer: Buffer): Buffer;
        encode(data: Buffer): Buffer;
      };
    };
  }
}
