
export function className(Class) {
  return (Class.constructor && Class.constructor.name) || 'Unknown'
}

export function assertExtended (context, BaseClass) {
  if (context.constructor === BaseClass) {
    throw new TypeError(`Abstract class ${className(BaseClass)} cannot be instantiated directly.`)
  }
}

export function assertMethods (context, BaseClass, ...methodNames) {
  methodNames.forEach((methodName) => {
    if (typeof this[methodName] !== 'function') {
      throw new TypeError(`Class ${className(context)} extending the ${className(BaseClass)} abstract class must define a ${methodName} method.`)
    }
  })
}