import React from 'react'
import { ListGroupItem } from 'reactstrap'
import classNames from 'class-names'

const ListGroupButton = ({ className, color = 'ultra-dark', size, ...props }) => (
  <ListGroupItem action tag='button'
    className={classNames(
      className,
      `btn btn-${color}`,
      { [`btn-${size}`]: size }
    )} {...props}/>
)

export default ListGroupButton