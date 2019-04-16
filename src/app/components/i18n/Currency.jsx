import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withProps } from 'recompose'
import { connect } from 'react-redux'

import omitProps from 'Utilities/omitProps'

export default compose(
  setDisplayName('Currency'),
  setPropTypes({
    children: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string // parseInt
    ]).isRequired,
    tag: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]),
    minPlaces: PropTypes.number,
    maxPlaces: PropTypes.number,
    lang: PropTypes.string,
  }),
  defaultProps({
    tag: 'span',
    minPlaces: 0,
    maxPlaces: 2,
  }),
  withProps(({ children }) => ({
    value: typeof(children) === 'string' ? parseInt(children) : children
  })),
  connect(({ i18n }) => ({
    currentLanguage: i18n.currentLanguage
  })),
  withHandlers({
    format: ({ lang, currentLanguage, minPlaces, maxPlaces }) =>
      new Intl.NumberFormat(`${lang || currentLanguage}-CA`, {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
        minimumFractionDigits: minPlaces,
        maximumFractionDigits: maxPlaces,
        useGrouping: true,
      }).format
  }),
  omitProps('dispatch', 'children', 'currentLanguage', 'minPlaces', 'maxPlaces')
)(({ value, tag: Tag, format, ...rest }) => (
  <Tag {...rest}>{format(value)}</Tag>
))
