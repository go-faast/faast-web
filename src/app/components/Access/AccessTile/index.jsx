import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import classNames from 'class-names'

import Icon from 'Components/Icon'
import CoinIcon from 'Components/CoinIcon'
import { accessTile as accessTileStyle } from './style'

const AccessTile = ({ name, icon, assets, className, children, ...props }) => (
  <Button className={classNames(accessTileStyle, className)} {...props}>
    {children || ([
      <h4 key='name' className='text-primary'>{name}</h4>,
      <Icon key='icon' src={icon} height='50px' className='m-2' />
    ])}
    {assets && assets.length > 0 && (
      <div>
        {assets.map((symbol) => (
          <CoinIcon key={symbol} symbol={symbol} inline size='sm' className='m-1'/>
        ))}
      </div>
    )}
  </Button>
)

AccessTile.propTypes = {
  name: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  assets: PropTypes.arrayOf(CoinIcon.propTypes.symbol)
}

AccessTile.defaultProps = {
  color: 'ultra-dark',
  assets: []
}

export default AccessTile
