import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import qs from 'query-string'
import { createLocation, parsePath } from 'history'

import omitProps from 'Utilities/omitProps'
const parseQs = (o) => typeof o === 'string' ? qs.parse(o, { ignoreQueryPrefix: true }) : (typeof o === 'object' ? o : {})
const stringifyQs = (o) => typeof o === 'object' ? qs.stringify(o, { addQueryPrefix: true }) : (typeof o === 'string' ? o : '')
const stringifyLocationQs = (o) => typeof o === 'object' ? ({ ...o, search: stringifyQs(o.search) }) : o

function mergeLocations (target, current) {
  let location
  if (typeof target === 'string') {
    location = parsePath(target)
  } else {
    location = { ...target }
  }
  location.search = stringifyQs({
    ...parseQs(current.search),
    ...parseQs(location.search)
  })
  return createLocation(location, null, null, current)
}

export default compose(
  setDisplayName('FaastLink'),
  setPropTypes({
    ...Link.propTypes,
    merge: PropTypes.bool,
  }),
  defaultProps({
    merge: false
  }),
  withRouter,
  withProps(({ to, merge, location: current }) => ({
    to: stringifyLocationQs(merge ? mergeLocations(to, current) : to)
  })),
  omitProps('merge', 'match', 'location', 'history', 'staticContext')
)(Link)
