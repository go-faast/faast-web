
export const className = (classOrInstance) => {
  return (typeof classOrInstance === 'function'
    ? classOrInstance.name
    : (classOrInstance.constructor && classOrInstance.constructor.name))
  || 'Unknown'
}

export const assertExtended = (context, BaseClass) => {
  if (context.constructor === BaseClass) {
    throw new TypeError(`Abstract class ${className(BaseClass)} cannot be instantiated directly.`)
  }
}

export const abstractMethod = (...methodNames) => (TargetClass) => {
  methodNames.forEach((methodName) => {
    TargetClass[methodName] = TargetClass[methodName] || function() {
      throw new TypeError(`Class ${className(this)} extending the abstract class ${className(TargetClass)} must define a ${methodName} method.`)
    }
  })
}