import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Root from './Root'
import 'Src/app/i18n'

export default Root

// Render your app
if (typeof document !== 'undefined') {
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate || ReactDOM.render
  const render = (Comp: any) => {
    renderMethod((<Comp />), document.getElementById('root'))
  }

  // Render!
  render(Root)
}
