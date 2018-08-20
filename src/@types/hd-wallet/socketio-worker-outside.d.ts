import { Stream, Emitter } from './stream';

import {
  InMessage as SocketWorkerInMessage,
  OutMessage as SocketWorkerOutMessage,
} from './dockerio-worker-inside';

type SocketWorkerFactory = () => Worker;

export class Socket {
  endpoint: string;
  socket: SocketWorkerHandler;
  _socketInited: Promise<void>;

  streams: Array<Stream<any>> = [];

  constructor(workerFactory: SocketWorkerFactory, endpoint: string)

  send(message: Object): Promise<any>

  close()

  observe(event: string): Stream<any>

  subscribe(event: string, ...values: Array<any>)
}

class SocketWorkerHandler {
  _worker: ?Worker;
  workerFactory: () => Worker;
  _emitter: ?Emitter<SocketWorkerOutMessage>;
  counter: number;

  constructor(workerFactory: () => Worker)

  _tryWorker(endpoint: string, type: string): Promise<Worker>

  init(endpoint: string): Promise<void>

  close()

  send(message: Object): Promise<any>

  observe(event: string): Stream<any>

  subscribe(event: string, ...values: Array<any>)

  _sendMessage(message: SocketWorkerInMessage)
}
