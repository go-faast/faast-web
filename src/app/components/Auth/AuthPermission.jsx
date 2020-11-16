import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'

import { withAuth } from 'Components/Auth'

const permissionType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.instanceOf(RegExp),
])

export default compose(
  setDisplayName('AuthPermission'),
  setPropTypes({
    has: PropTypes.oneOfType([
      PropTypes.arrayOf(permissionType),
      permissionType,
    ]).isRequired,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    wrapper: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    failComponent: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.string,
    ]),
  }),
  defaultProps({
    children: undefined,
    wrapper: 'div',
    failComponent: false,
  }),
  withAuth(),
)(({ auth: { hasPermission }, has, children, wrapper: Wrapper, failComponent: FailComponent }) => (
  hasPermission(...(Array.isArray(has) ? has : [has]))
    ? (Array.isArray(children) ? (<Wrapper>{children}</Wrapper>) : children)
    : (['string', 'function'].includes(typeof FailComponent)
      ? (<FailComponent/>)
      : FailComponent)
))