declare module 'blockstack' {
  type UserData = {
    appPrivateKey: string
  }
  export function loadUserData(): UserData
}
