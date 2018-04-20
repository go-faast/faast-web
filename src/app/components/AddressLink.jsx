import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'


const AddressLink = ({ tag: Tag, address, className, children, ...props }) => (
  <Tag href={`https://etherscan.io/address/${address}`} target='_blank' rel='noopener'
    className={classNames('word-break-all', className)} {...props}>
    {children || address}
  </Tag>
)

AddressLink.propTypes = {
  tag: tagPropType,
  address: PropTypes.string.isRequired,
}

AddressLink.defaultProps = {
  tag: 'a',
}

export default AddressLink
