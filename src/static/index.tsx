import React from 'react'
import ReactDOM from 'react-dom'

import Root from './Root'

export default Root

// Render your app
if (typeof document !== 'undefined') {
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate || ReactDOM.render
  const render = (comp) => {
    renderMethod(<comp />, document.getElementById('root'))
  }

  // Render!
  render(Root)
}
