declare module '@ledgerhq/logs' {
  export type Log = {
    type: string,
    message?: string,
    data?: any,
    id: string, // unique amount all logs
    date: Date // date of the log
  }

  export type Unsubscribe = () => void

  export function log(type: string, message?: string, data?: any): void
  
  export function listen(cb: (log: Log) => void): Unsubscribe
}
