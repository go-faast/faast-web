import styleVars from 'Styles/variables.scss'

export const breakpointWidths = Object.keys(styleVars)
  .filter((key) => /^breakpoint-/.test(key))
  .map((key) => [key.replace('breakpoint-', ''), styleVars[key]])
  .reduce((result, [breakpoint, width]) => result.set(breakpoint, width), new Map())