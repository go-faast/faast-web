export class WorkerChannel {
  lastI: number = 0;
  worker: Worker;
  pending: {[i: number]: ((f: any) => any)};
  onMessage: (event: Event) => void;

  constructor(worker: Worker)
  open()
  postMessage(msg: Object): Promise<any>
  receiveMessage(event: any)
}
