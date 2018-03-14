import React from 'react'
import AccessTile from 'Components/AccessTile'
import blockstackLogo from 'Img/blockstack-logo.png'

const BlockstackView = (props) => (
  <AccessTile name='Blockstack' icon={blockstackLogo} {...props} />
)

export default BlockstackView
