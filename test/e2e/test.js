import config from './config'
import setup from './setup'
import navigation from './navigation'

const clients = {};

[
  setup,
  navigation
].forEach(f => f(config, clients))

