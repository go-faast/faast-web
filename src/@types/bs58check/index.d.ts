/// <reference types="node"/>

declare module 'bs58check' {
  export function decode(bs58String: string): Buffer
  export function encode(data: Buffer): string
}
