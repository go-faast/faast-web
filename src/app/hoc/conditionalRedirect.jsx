import { branch, renderComponent, withProps } from 'recompose'
import { Redirect } from 'react-router-dom'
import { isFunction } from 'lodash'

export default (redirectPath, predicate) => branch(
  predicate,
  renderComponent(withProps((props) => ({
    to: isFunction(redirectPath) ? redirectPath(props) : redirectPath
  }))(Redirect))
)
