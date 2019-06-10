export default {
  baseUrl: 'https://127.0.0.1:8000',
  users: [
    {
      key: 'user1',
      wallets: [
        {
          key: 'testwallet1',
          type: 'keystore',
          file: './testwallet1',
          password: 'abcdefgh'
        }
      ]
    }
  ]
}
