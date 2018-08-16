
type Handler<T> = (value: T, detach: () => void) => void;
type Listener<T> = {
  handler: Handler<T>,
  detached: boolean,
};

export class Emitter<T> {
  listeners: Array<Listener<T>>;

  constructor()
  destroy()
  attach(handler: Handler<T>)
  detach(handler: Handler<T>)
  emit(value: T)
}

export type Disposer = () => void;
type Finisher = () => void;
type Updater<T> = (value: T) => void;
type Controller<T> = (update: Updater<T>, finish: Finisher) => Disposer;

export class Stream<T> {
  values: Emitter<T>;
  finish: Emitter<void>;
  dispose: Disposer;

  static fromEmitter<T>(
      emitter: Emitter<T>,
      dispose: () => void
  ): Stream<T>
  static fromEmitterFinish<T>(
      emitter: Emitter<T>,
      finisher: Emitter<void>,
      dispose: () => void
  ): Stream<T>
  static fromArray<T>(
      array: Array<T>
  ): Stream<T>
  static fromPromise<T>(
      promise: Promise<Stream<T>>
  ): Stream<T>
  static generate<T>(
      initial: T,
      generate: (state: T) => Promise<T>,
      condition: (state: T) => boolean
  ): Stream<T>
  static setLater<T>(): {
      stream: Stream<T>,
      setter: (s: Stream<T>) => void,
  }
  static simple<T>(value: T): Stream<T>
  static combine<T>(streams: Array<Stream<T>>): Stream<Array<T>>
  static combineFlat<T>(streams: Array<Stream<T>>): Stream<T>
  static filterNull<T>(
      stream: Stream<?T>
  ): Stream<T>
  constructor(controller: Controller<T>)
  awaitFirst(): Promise<T>
  awaitFinish(): Promise<void>
  awaitLast(): Promise<T>
  map<U>(fn: (value: T) => U): Stream<U>
  mapPromise<U>(fn: (value: T) => Promise<U>): Stream<U>
  mapPromiseError<U>(fn: (value: T) => Promise<U>): Stream<U | Error>
  filter(fn: (value: T) => boolean): Stream<T>
  reduce<U>(fn: (previous: U, value: T) => U, initial: U): Promise<U>
  concat(other: Stream<T>): Stream<T>
}

export class StreamWithEnding<UpdateT, EndingT> {
  stream: Stream<UpdateT>;
  ending: Promise<EndingT>; // ending never resolves before stream finishes
  dispose: (e: Error) => void;

  static fromStreamAndPromise(s: Stream<UpdateT>, ending: Promise<EndingT>): StreamWithEnding<UpdateT, EndingT>

  static fromPromise<U, E>(p: Promise<StreamWithEnding<U, E>>): StreamWithEnding<U, E>
}
