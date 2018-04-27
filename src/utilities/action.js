import { createAction } from 'redux-act'

export { createAction }
export const newScopedCreateAction = (scopeOrFileName) => {
  const scope = scopeOrFileName
    .replace(/^.*\//, '') // Strip leading directories
    .replace(/\.\w+$/, '') // Strip file extension
  return (type, ...args) => createAction(`@${scope}/${type}`, ...args)
}
