import styleVars from 'Styles/variables.scss'

const sortedBreakpoints = Object.keys(styleVars)
  .filter((key) => /^breakpoint-/.test(key))
  .map((key) => {
    const minWidth = styleVars[key]
    const parsedMinWidth = Number.parseInt(styleVars[key].replace('px', ''))
    return ({
      name: key.replace('breakpoint-', ''),
      minWidth: minWidth,
      parsedMinWidth: parsedMinWidth
    })
  })
  .sort(({ parsedMinWidth: width1 }, { parsedMinWidth: width2 }) => width1 - width2) // sort from smallest to largest

export const breakpointWidths = sortedBreakpoints
  .reduce((result, { name, minWidth }) => result.set(name, minWidth), new Map())


// The following functions aim to have behaviour consistent with styles/mixins/breakpoints

const getBreakpointIndex = (breakpoint) => sortedBreakpoints.find(({ name }) => name === breakpoint)

export const breakpointNext = (breakpoint) => {
  const idx = getBreakpointIndex(breakpoint)
  return (idx >= 0 && idx < sortedBreakpoints.length - 1) ? sortedBreakpoints[idx + 1].name : null
}

export const breakpointPrev = (breakpoint) => {
  const idx = getBreakpointIndex(breakpoint)
  return (idx > 0 && idx < sortedBreakpoints.length) ? sortedBreakpoints[idx - 1].name : null
}

export const breakpointMin = (breakpoint) => {
  const bp = getBreakpointIndex(breakpoint)
  return bp.parsedMinWidth !== 0 ? bp.minWidth : null
}

export const breakpointMax = (breakpoint) => {
  const next = breakpointNext(breakpoint)
  return next ? `${breakpointMin(next).parsedMinWidth - 0.02}px` : null
}

export const breakpointInfix = (breakpoint) => {
  return breakpointMin(breakpoint) === null ? '' : `-${breakpoint}`
}

// Returns true if at least breakpoint min width, inclusive
export const mediaBreakpointUp = (mqState, breakpoint) => {
  return mqState[breakpoint]
}

// Returns true if at most breakpoint max width, inclusive
export const mediaBreakpointDown = (mqState, breakpoint) => {
  return mqState[breakpoint] && !mqState[breakpointNext(breakpoint)]
}

// Returns true if in between two breakpoint widths, inclusive
export const mediaBreakpointBetween = (mqState, lower, upper) => {
  return !mqState[breakpointPrev(lower)] && !mqState[breakpointNext(upper)]
}

// Returns true if within a breakpoint min and max widths
export const mediaBreakpointOnly = (mqState, breakpoint) => {
  return !mqState[breakpointPrev(breakpoint)] && mqState[breakpoint] && !mqState[breakpointNext(breakpoint)]
}