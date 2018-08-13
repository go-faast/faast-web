/// <reference types="node"/>

declare module 'rlp' {

  type EncodeScalarInput = Buffer | string | number
  type EncodeInput = EncodeScalarInput | Array<EncodeScalarInput>

  export function encode(input: EncodeInput): Buffer
  export function decode(input: EncodeInput): Array<Buffer>
  export function getLength(input: EncodeInput): number
}
