import parseUnit from 'parse-unit'
import log from 'Utilities/log'
import { isFunction, isObject, set, camelCase } from 'lodash'

import * as styleVars from 'faast-ui/src/style/variables'

const nestedStyleVars = Object.entries(styleVars)
  .reduce((result, [key, value]) => set(result, key.split('_').map(camelCase), value), {})

const { themeColor, zIndex, chartColor, breakpoint } = nestedStyleVars

export { nestedStyleVars as styleVars, themeColor, zIndex, chartColor, breakpoint }

const defaultRotateAbbreviations = {
  up: '0',
  right: '90deg',
  down: '180deg',
  left: '270deg'
}

const defaultScalarAbbreviations = {
  'sm': 1,
  'md': 2,
  'lg': 4
}

export const scaleUnit = (unit, scalar) => {
  const [value, units] = parseUnit(unit)
  return [value * scalar, units].join('')
}

export const reduceStyles = (...styles) => styles.reduce((result, style) => {
  if (isFunction(style)) {
    return { ...result, ...style(result) }
  }
  if (isObject(style)) {
    return { ...result, ...style }
  }
  return result
}, {})

export const rotate = (dir, rotateAbbreviations = defaultRotateAbbreviations) => {
  if (!dir) return {}
  dir = rotateAbbreviations[dir] || dir
  return { transform: `rotate(${dir})` }
}

export const resize = (scalar, scalarAbbreviations = defaultScalarAbbreviations) => (style = {}) => {
  if (!scalar) return {}
  scalar = scalarAbbreviations[scalar] || scalar
  if (typeof scalar !== 'number') {
    log.debug(`Cannot resize width and height by non scalar ${scalar}`)
    return style
  }
  const { width, height } = style
  return {
    ...(!width ? {} : { width: scaleUnit(width, scalar) }),
    ...(!height ? {} : { height: scaleUnit(height, scalar) })
  }
}

export const fill = (color) => {
  if (!color) return {}
  color = themeColor[color] || color
  return { fill: color }
}