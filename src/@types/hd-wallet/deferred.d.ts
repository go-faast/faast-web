export type Deferred<T> = {
  promise: Promise<T>,
  resolve: (t: T) => void,
  reject: (e: Error) => void,
};
