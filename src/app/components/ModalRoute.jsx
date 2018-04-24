import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Route } from 'react-router-dom'
import urlJoin from 'url-join'
import { pick } from 'lodash'

export default compose(
  setDisplayName('ModalRoute'),
  setPropTypes({
    basePath: PropTypes.string,
    ...Route.propTypes
  }),
  defaultProps({
    basePath: '/',
  }),
  connect(null, { routerPush: push }),
  withHandlers(({ routerPush, basePath, component, render }) => {
    // <Route component> takes precedence over <Route render> so don’t use both in the same <Route>
    if (component) { return {} }
    const toggle = () => routerPush(basePath)
    return {
      render: () => (props) => render({ ...props, isOpen: true, toggle })
    }
  }),
  mapProps(({ basePath, path, ...props }) => ({
    ...pick(props, Object.keys(Route.propTypes)),
    path: urlJoin(basePath, path),
  })),
)(Route)
