import React, { Component } from 'react'
import { isObject, isString } from 'lodash'

const capitalizeFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/**
  * Provides component with state as a prop a setter function.
  * Requires first argument of type string or object that determines the names of the
  * 3 props provided to the component.
  * If argument is a string: 'is', 'set', and 'toggle' will be used as prefixes.
  * If argument is an object: propName, setterName, and togglerName are used to specify
  * them explicitly.
  * Additionally, if a second argument is provided or the object contains the field
  * defaultState it will be used as the initial value.
  */
const withToggle = (nameOrOptions, defaultState) => (Wrapped) => {
  let baseName
  let propName
  let togglerName
  let setterName

  if (isObject(nameOrOptions)) {
    ({ propName, setterName, togglerName, defaultState } = nameOrOptions)
    if (!isString(propName)) {
      throw new Error(`withToggle HOC requires 'propName' option of type string but got ${typeof propName}`)
    }
    baseName = propName
  } else if (isString(nameOrOptions)) {
    baseName = nameOrOptions
  } else {
    throw new Error(`withToggle HOC requires argument of type string or object but got ${typeof propName}`)
  }

  baseName = capitalizeFirst(baseName)
  if (!propName) {
    propName = `is${baseName}`
  }
  if (!setterName) {
    setterName = `set${baseName}`
  }
  if (!togglerName) {
    togglerName = `toggle${baseName}`
  }

  class WithToggle extends Component {
    constructor() {
      super()
      this.state = {
        toggleState: defaultState || false
      }
    }

    setToggle = (toggle) => {
      this.setState({ toggleState: toggle })
    }

    toggle = () => {
      this.setToggle(!this.state.toggleState)
    }

    render () {
      const props = {
        [propName]: this.state.toggleState,
        [togglerName]: this.toggle,
        [setterName]: this.setToggle,
        ...this.props
      }
      return <Wrapped {...props}/>
    }
  }

  WithToggle.propTypes = Component.propTypes
  WithToggle.displayName = `withToggle(${Component.displayName})`

  return WithToggle
}

export default withToggle