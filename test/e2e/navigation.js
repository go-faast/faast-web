import { Selector } from 'testcafe'

export default (config) => {
  fixture `Navigation`
    .page(config.baseUrl)

  test('Home page', async t => {
    const header = Selector('h1.hero-title .mb-4')
    await t
      .expect(header.innerText)
      .eql('Don’t Get Goxxed. Own Your Crypto.')
  })

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
}
