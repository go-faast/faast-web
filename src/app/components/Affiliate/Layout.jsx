import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'reactstrap'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import AffiliateNavbar from 'Components/Affiliate/Navbar'

const AffiliateLayout = ({ tag: Tag, navbarProps, afterNav, className, children, ...props }) => (
  <div>
    <AffiliateNavbar {...navbarProps}/>
    {afterNav}
    <Tag className={classNames(className, 'content pb-5')} {...props}>
      {children}
    </Tag>
  </div>
)

AffiliateLayout.propTypes = {
  tag: tagPropType,
  navbarProps: PropTypes.object
}

AffiliateLayout.defaultProps = {
  tag: Container,
  navbarProps: {}
}

export default AffiliateLayout
