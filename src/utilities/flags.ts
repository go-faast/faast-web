import { localStorageGet } from './storage'

export function isUnrestricted() {
  return localStorageGet('unrestricted') === 'true'
}
