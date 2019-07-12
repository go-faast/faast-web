/// <reference types='node' />

declare namespace LedgerHQ {
  export class TransportError extends Error {
    constructor(message: string, id: string)
  }

  export class TransportStatusError extends Error {
    constructor(statusCode: number)
  }

  export function getAltStatusMessage(code: number): string | undefined

  export namespace StatusCodes {
    const PIN_REMAINING_ATTEMPTS = 0x63c0
    const INCORRECT_LENGTH = 0x6700
    const COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 0x6981
    const SECURITY_STATUS_NOT_SATISFIED = 0x6982
    const CONDITIONS_OF_USE_NOT_SATISFIED = 0x6985
    const INCORRECT_DATA = 0x6a80
    const NOT_ENOUGH_MEMORY_SPACE = 0x6a84
    const REFERENCED_DATA_NOT_FOUND = 0x6a88
    const FILE_ALREADY_EXISTS = 0x6a89
    const INCORRECT_P1_P2 = 0x6b00
    const INS_NOT_SUPPORTED = 0x6d00
    const CLA_NOT_SUPPORTED = 0x6e00
    const TECHNICAL_PROBLEM = 0x6f00
    const OK = 0x9000
    const MEMORY_PROBLEM = 0x9240
    const NO_EF_SELECTED = 0x9400
    const INVALID_OFFSET = 0x9402
    const FILE_NOT_FOUND = 0x9404
    const INCONSISTENT_FILE = 0x9408
    const ALGORITHM_NOT_SUPPORTED = 0x9484
    const INVALID_KCV = 0x9485
    const CODE_NOT_INITIALIZED = 0x9802
    const ACCESS_CONDITION_NOT_FULFILLED = 0x9804
    const CONTRADICTION_SECRET_CODE_STATUS = 0x9808
    const CONTRADICTION_INVALIDATION = 0x9810
    const CODE_BLOCKED = 0x9840
    const MAX_VALUE_REACHED = 0x9850
    const GP_AUTH_FAILED = 0x6300
    const LICENSING = 0x6f42
    const HALTED = 0x6faa
  }
}

declare module '@ledgerhq/errors' {
  import TransportError = LedgerHQ.TransportError
  import TransportStatusError = LedgerHQ.TransportStatusError
  import getAltStatusMessage = LedgerHQ.getAltStatusMessage
  import StatusCodes = LedgerHQ.StatusCodes
  export { TransportError, TransportStatusError, getAltStatusMessage, StatusCodes }
}
