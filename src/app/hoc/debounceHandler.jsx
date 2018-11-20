import { debounce } from 'debounce'
import { withPropsOnChange } from 'recompose'

/**
 * Hoc for debouncing an existing component handler function.
 *
 * The handler creators passed into withHandlers get called on every change to
 * props and debounce can't be used in there because the function identity keeps
 * changing. However, the handlers produced by withHandlers preserve their identity
 * so they can be debounced. This hoc wraps an existing handler created by withHandlers
 * in a way that doesn't break whenever props change.
 */
export default (handlerName, ...debounceArgs) => withPropsOnChange(
  [handlerName],
  (props) => ({
    [handlerName]: console.log('debounce') || debounce(props[handlerName], ...debounceArgs)
  })
)
