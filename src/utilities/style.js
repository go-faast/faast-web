import parseUnit from 'parse-unit'
import styleVars from 'faast-ui/src/style/variables'
import log from 'Utilities/log'
import { reduce, isFunction, isObject } from 'lodash'

const defaultRotateAbbreviations = {
  up: '0',
  right: '90deg',
  down: '180deg',
  left: '270deg'
}

const defaultScalarAbbreviations = {
  'sm': 0.5,
  'md': 1,
  'lg': 2
}

export const scaleUnit = (unit, scalar) => {
  const [value, units] = parseUnit(unit)
  return [value * scalar, units].join('')
}

export const reduceStyles = (...styles) => reduce(styles, (result, style) => {
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
  color = styleVars[`themeColor-${color}`] || color
  return { fill: color }
}