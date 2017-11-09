import React from 'react'
import Expandable from 'Components/Expandable'

export const addKeys = (arr) => (
  arr.map((a, i) => {
    if (a instanceof Object && a.hasOwnProperty('key') && a.key === null) {
      return React.cloneElement(a, { key: i })
    }
    return a
  })
)

export const expandable = (props) => (
  <Expandable {...props} />
)
