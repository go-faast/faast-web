import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, mapProps } from 'recompose'
import { connect } from 'react-redux'

import omitProps from 'Utilities/omitProps'

// TimeZone used by DateTimeFormat component
// IE11 doesn't support timeZones other than UTC
// Waiting on https://github.com/andyearnshaw/Intl.js/issues/19
const TIME_ZONE = 'UTC';

const onlyDateOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

const onlyTimeOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short',
}

function resolveOptions(onlyDate, onlyTime) {
  if (!(onlyDate && onlyTime)) {
    // Mutually exclusive
    if (onlyDate) {
      return onlyDateOptions
    }
    if (onlyTime) {
      return onlyTimeOptions
    }
  }
  return { ...onlyDateOptions, ...onlyTimeOptions }
}

function parseDate(date) {
  if (typeof(date) === 'string') {
    return new Date(date)
  }
  if (typeof(date) === 'number') {
    return new Date(date < 10000000000 // constructor expects epoch milliseconds
      ? date * 1000 
      : date)
  }
  return date
}

export default compose(
  setDisplayName('DateTime'),
  setPropTypes({
    children: PropTypes.oneOfType([
      PropTypes.number, // epoch milliseconds or seconds
      PropTypes.string, // Date.parse
      PropTypes.object, // instaceof Date
    ]).isRequired,
    tag: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]),
    onlyDate: PropTypes.bool,
    onlyTime: PropTypes.bool,
    options: PropTypes.object // Intl.DateTimeFormat options
  }),
  defaultProps({
    tag: 'span',
    onlyDate: false,
    onlyTime: false,
    options: {},
  }),
  mapProps(({ children, onlyDate, onlyTime, options, ...rest }) => ({
    value: parseDate(children),
    options: {
      ...resolveOptions(onlyDate, onlyTime),
      ...options
    },
    ...rest
  })),
  connect(({ i18n }) => ({
    currentLanguage: i18n.currentLanguage
  })),
  withHandlers({
    format: ({ currentLanguage, options }) => 
      new Intl.DateTimeFormat(`${currentLanguage}-CA`, {
        timeZone: TIME_ZONE,
        ...options,
      }).format
  }),
  omitProps('dispatch', 'currentLanguage', 'options')
)(({ value, tag: Tag, format, ...rest }) => (
  <Tag {...rest}>{format(value)}</Tag>
))
