export type InMessage = {
    type: 'init',
    endpoint: string,
    connectionType: string,
} | {
    type: 'observe',
    event: string,
} | {
    type: 'unobserve',
    event: string,
} | {
    type: 'subscribe',
    event: string,
    values: Array<any>,
} | {
    type: 'send',
    message: Object,
    id: number,
} | {
    type: 'close',
}

export type OutMessage = {
    type: 'emit',
    event: string,
    data: any,
} | {
    type: 'sendReply',
    reply: any,
    id: number,
} | {
    type: 'initDone',
} | {
    type: 'initError',
}
