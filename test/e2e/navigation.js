import { Selector } from 'testcafe'

export default (config) => {
  fixture `Navigation`
    .page(config.baseUrl)

  const LINK =  (x) =>  Selector('a').withAttribute('href', x).exists
  const HREF =  (x) =>  Selector('a').withAttribute('href', x)
  const SPAN = (x) => Selector('span').withText(x)

  test('Navigate to Market Maker', async t => {
    console.log('market maker')
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
    await t
      .expect(LINK('/app/connect')).ok()
      .expect(LINK('/wallets/trezor')).ok()
      .expect(LINK('/wallets/ledger-wallet')).ok()
      .expect(LINK('/wallets/metamask')).ok()
      .expect(LINK('/wallets/mist-browser')).ok()
      .expect(LINK('/wallets/trust-wallet')).ok()
      .expect(LINK('/wallets/coinbase-wallet')).ok()
      .expect(LINK('/wallets/status')).ok()
  })

  test('Bottom menu links', async t => {

    await t
      .expect(LINK('/what-are-smart-contracts')).ok()
      .expect(LINK('/affiliates')).ok()
      .expect(LINK('/app')).ok()
      .expect(LINK('/app/swap')).ok()
      .expect(LINK('/blog')).ok()
      .expect(LINK('/app/assets/trending')).ok()
      .expect(LINK('/app/assets/watchlist')).ok()
      .expect(LINK('/what-is-an-ico')).ok()
      .expect(LINK('/what-are-smart-contracts')).ok()
      .expect(LINK('/what-is-the-difference-between-ico-ipo-ito')).ok()
      .expect(LINK('/what-is-ethereum')).ok()
      .expect(LINK('/what-is-a-dao')).ok()
      .expect(LINK('/how-to-buy-ethereum')).ok()
      .expect(LINK('https://api.faa.st/')).ok()
      .expect(LINK('/static/faast-press-kit.zip')).ok()
  })

  test('Thumb of page', async t => {
    await t
      .expect(LINK('mailto:support@faa.st')).ok()
      .expect(LINK('/terms')).ok()
      .expect(LINK('/privacy')).ok()
      .expect(LINK('https://github.com/go-faast')).ok()
      .expect(LINK('https://www.facebook.com/Faast-237787136707810')).ok()
      .expect(LINK('https://twitter.com/gofaast')).ok()
      .expect(LINK('https://slack.faa.st/')).ok()
      .expect(LINK('https://www.reddit.com/r/gofaast/')).ok()
  })

  test('Goes to bunch of subpages', async t => {
    const affiliateid = Selector('input').withAttribute('placeholder', 'Affiliate Id')
    const affil = HREF('/affiliates')
    const supported = HREF('/assets')

    await t

      // .click(affil)
      // .wait(2000)
      // .expect(affiliateid).ok()
      .expect(LINK('/assets')).ok()
      await supported()
      // .expect(LINK('/app/swap?to=BTC')).ok()
  })


  test('Goes to wallets info', async t => {
    await t
      .click(HREF('/wallets/trezor'))
      .expect(LINK('https://trezor.io/')).ok()

      .click(HREF('/wallets/ledger-wallet'))
      .expect(LINK('https://www.ledger.com/')).ok()

      .click(HREF('/wallets/metamask'))
      .expect(LINK('https://metamask.io/')).ok()

      .click(HREF('/wallets/mist-browser'))
      .expect(HREF('https://github.com/ethereum/mist')).ok()

      .click(HREF('/wallets/trust-wallet'))
      .expect(LINK('https://trustwalletapp.com/')).ok()

      .click(HREF('/wallets/coinbase-wallet'))
      .expect(LINK('https://wallet.coinbase.com/')).ok()

      .click(HREF('/wallets/status'))
      .expect(LINK('https://status.im/')).ok()
  })


  test('Goes to trending', async t => {
    await t
      .click(HREF('/app/assets/trending'))
      .wait(2000)
      await t.expect(Selector('#form-tradeableForm-requiredCheckbox', { visibilityCheck: true, timeout: 120000 }).exists).ok()
  })


  test('Tests texts in pages', async t => {
    const H4 = Selector('h4').innerText
    await t
      .click(HREF('/what-is-the-difference-between-ico-ipo-ito'))
      .expect(H4)
      .eql('What is the difference between an ICO, ITO and IPO')

      .click(HREF('/what-is-an-ico'))
      .expect(H4)
      .eql("An introduction to ICO's")

      .wait(2000)
      .click(HREF('/what-is-a-dao'))
      .expect(H4)
      .eql('What is a DAO?')

      .wait(2000)
      .click(HREF('/what-is-ethereum'))
      .expect(H4)
      .eql('What is Ethereum?')

      .wait(2000)
      .click(HREF('/how-to-buy-ethereum'))
      .expect(H4)
      .eql('How to Buy Ethereum')

      .click(HREF('/terms'))
      .expect(H4)
      .eql('Terms of Use')

      .click(HREF('/privacy'))
      .expect(H4)
      .eql('Privacy Policy')
  })

  test('Check languages', async t => {
    const H4 = Selector('h4').innerText
    const lang = Selector('a').withAttribute('to', '/assets')
    const sp = Selector('img').withAttribute('src', '/static/img/spain.a62a83f3.svg')
    const jp = Selector('img').withAttribute('src', '/static/img/japan.f8dc0f04.svg')
    const ru = Selector('img').withAttribute('src', '/static/img/russia.562474ef.svg')
    const chi = Selector('img').withAttribute('src', '/static/img/china.87d6c351.svg')

    await t
      .click(lang)
      .click(sp)

      .click(HREF('/what-is-an-ico'))
      .expect(H4)
      .eql("An introduction to ICO's")

      .click(lang)
      .click(jp)
      .click(HREF('/ja'))
      .expect(LINK('/ja/wallets/mist-browser')).ok()
      .expect(LINK('https://github.com/go-faast')).ok()
      .click(HREF('/what-is-an-ico'))
      .expect(H4)
      .eql("An introduction to ICO's")

      .click(lang)
      .click(ru)
      .click(HREF('/ru'))
      .expect(LINK('https://github.com/go-faast')).ok()
      .expect(LINK('/app/assets/watchlist')).ok()
      .click(HREF('/what-is-an-ico'))
      .expect(H4)
      .eql("An introduction to ICO's")

      .click(lang)
      .click(chi)
      .click(HREF('/zh'))
      .expect(LINK('/affiliates')).ok()
      .expect(LINK('/app/connect')).ok()
      .click(HREF('/what-is-an-ico'))
      .expect(H4)
      .eql("An introduction to ICO's")
  })

  test('Go to portfolio', async t => {
    const upload = Selector('input').withAttribute('type', 'file')
    const dropdown = Selector('span').withAttribute('class', 'mr-2 cursor-pointer font-size-xxs badge badge-light')
    const tradeable = Selector('input').withAttribute('id', 'form-tradeableForm-requiredCheckbox')
    const add = Selector('i').withAttribute('class', 'fa fa-plus')
    const asset = Selector('span').withText('Add Asset')
    const swap = Selector('span').withText('Swap')
    const firstBlood = SPAN('Firstblood')
    const eth = SPAN('Ethereum')
    const create = Selector('span').withText('Create Swap')
    const submit = Selector('button').withAttribute('type','submit')
    const x = Selector('span').withText('x')
    const nameInput = Selector('input').withAttribute('name', 'searchAsset')
    const amount = Selector('#form-swapWidget-sendAmount')
    const wallet = Selector('button').withText('External')
    const max = Selector('button').withAttribute('class', 'btn btn-link-plain')
  
    await t
      .click(HREF('/app/connect'))
      .wait(4000)
      .expect(LINK('/app/connect/hw/trezor')).ok()
      .expect(LINK('/app/connect/hw/ledger')).ok()
      .setFilesToUpload(upload, [
        './testwallet1',        
    ])
    .expect(dropdown).ok()
    .expect(SPAN('Portfolio Holdings')).ok()
    .expect(firstBlood).ok()
    .expect(eth).ok()
    .expect(SPAN('0.01')).ok()
    .expect(SPAN('29.9')).ok()
    .click(firstBlood)
    .wait(1000)
    .expect(Selector('h4').withText('Firstblood')).ok()
    .navigateTo('/app/dashboard')
    .wait(4000) 
    .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_ETH.png'))
    .wait(1000)
    .expect(Selector('h4').withText('Ethereum')).ok()
    .navigateTo('/app/assets')
    .wait(1000)
    .navigateTo('/app/assets/trending')
    .click(tradeable)
    .wait(1000)
    .click(tradeable)
    .navigateTo('/app/assets/watchlist')
    .wait(1000)
    .navigateTo('/app/rebalance')
    .wait(1000)
    .click(add)
    .expect(asset).ok()
    .click(x)
    .wait(500)
    .click(swap)
    .expect(create).ok()
    .expect(submit).ok()
    .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_ETH.png'))
    .typeText(nameInput, 'tusd')
    .wait(1000)
    .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_TUSD.png'))


    .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_BTC.png'))
    .typeText(nameInput, 'eth')
    .wait(1000)
    .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_ETH.png'))
    
    .click(Selector('#form-swapWidget-requiredCheckbox'))
    .click(wallet)
    .click(max)    
    .wait(4000)
    // .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_BTC.png'))
    // .typeText(nameInput, 'eth')
    // .wait(1000)
    // .click(Selector('img').withAttribute('src', 'https://api.faa.st/api/v1/public/static/img/coins/icon_ETH.png'))
    // .typeText(amount, '0.03')
    // .click(Selector('#form-swapWidget-requiredCheckbox'))
    .click(submit)
    .wait(5000)
    .expect(Selector('h4').withText('Confirm Swap Transaction')).ok()
    .click(SPAN('Begin signing'))
    .wait(1000)
    .click(SPAN('Cancel'))
    .wait(1000)
    .click(SPAN('Cancel'))

      
      
  })
 
}
