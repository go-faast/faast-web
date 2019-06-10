import ET from './et'

export default (config, clients) => {
  fixture `Setup`

  test('Ensure E.T. is running', async t => {
    await t
      .expect(clients.ET.initialized).ok()
  })
    .before(async () => {
      clients.ET = new ET()
      await clients.ET.init(config)
    })
}

