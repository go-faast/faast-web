import { Selector } from 'testcafe'

export default (config) => {
  fixture `Navigation`
    .page(config.baseUrl)

  // test('Home page', async t => {
  //   const header = Selector('.hero-title').find('.mb-4')
  //   await t
  //     .expect(header.innerText)
  //     .eql('Don’t Get Goxxed. Own Your Crypto.')
  // })

  test('Navigate to Market Maker', async t => {
    await t
      .navigateTo('./market-maker')
      .expect(Selector('#root').child('div').nth(0).child('div').nth(0).find('h1').innerText)
      .eql('Put your Bitcoin to work')
  })

  test('Navigate to Blog', async t => {
    await t
      .navigateTo('./blog')
      .expect(Selector('#root').child('div').nth(0).child('h4').innerText)
      .eql('Newest Blog Posts')
  })

  test('See the home page urls', async t => {
    const firstswap = Selector('a').withAttribute('href', '/app/swap?from=BTC&to=ETH').exists    
    const walletconnect = Selector('a').withAttribute('href', '/app/connect').exists
    const assests = Selector('a').withAttribute('href', '/assets').exists
    const startTrading = Selector('a').withAttribute('href', '/app').exists
    const trezor = Selector('a').withAttribute('href', '/wallets/trezor').exists
    const ledger = Selector('a').withAttribute('href', '/wallets/ledger-wallet').exists
    const metamask = Selector('a').withAttribute('href', '/wallets/metamask').exists
    const mist = Selector('a').withAttribute('href', '/wallets/mist-browser').exists
    const trustwallet = Selector('a').withAttribute('href', '/wallets/trust-wallet').exists
    const coinbase = Selector('a').withAttribute('href', '/wallets/coinbase-wallet').exists
    const status = Selector('a').withAttribute('href', '/wallets/status').exists

    await t
      .expect(firstswap).ok()    
      .expect(walletconnect).ok()
      .expect(assests).ok()
      .expect(startTrading).ok()
      .expect(trezor).ok()
      .expect(ledger).ok()
      .expect(metamask).ok()
      .expect(mist).ok()
      .expect(trustwallet).ok()
      .expect(coinbase).ok()
      .expect(status).ok()
  })
}
