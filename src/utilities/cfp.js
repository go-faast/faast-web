import Fp2 from 'fingerprintjs2'
import log from './log'

let cfp = ''

async function generate() {
  try {
    const components = await Fp2.getPromise()
    const values = components.map(({ value }) => value)
    cfp = Fp2.x64hash128(values.join(''), 31)
    log.log('generate cfp', cfp)
  } catch (e) {
    log.error('failed to generate cfp', e)
  }
}

if (window.requestIdleCallback) {
  requestIdleCallback(() => {
    generate()
  })
} else {
  setTimeout(() => {
    generate()
  }, 500)
}

export default async function get() {
  if (cfp === '') {
    await generate()
  }
  return cfp
}
