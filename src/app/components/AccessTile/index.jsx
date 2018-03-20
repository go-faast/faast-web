import React from 'react'
import { Button } from 'reactstrap'
import classNames from 'class-names'
import { accessTile as accessTileStyle } from './style'

const AccessTile = ({ name, icon, className, children, ...props }) => (
  <Button className={classNames(accessTileStyle, className)} {...props}>
    {children || ([
      <h4 key='name' className='text-primary'>{name}</h4>,
      <img key='icon' src={icon} height='50px' className='m-2' />
    ])}
  </Button>
)

AccessTile.defaultProps = {
  color: 'ultra-dark'
}

export default AccessTile
