import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container } from 'reactstrap'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import AffiliateNavbar from 'Components/Affiliate/Navbar'

export default compose(
  setDisplayName('AffiliateLayout'),
  setPropTypes({
    tag: tagPropType,
    navbarProps: PropTypes.object,
    clickableHeaderLink: PropTypes.bool
  }),
  defaultProps({
    tag: Container,
    navbarProps: {},
    clickableHeaderLink: true
  }),
)(({ tag: Tag, navbarProps, clickableHeaderLink, afterNav, className, children, ...props }) => (
  <div>
    <AffiliateNavbar clickableLogo={clickableHeaderLink} {...navbarProps}/>
    {afterNav}
    <Tag className={classNames(className, 'content pb-5')} {...props}>
      {children}
    </Tag>
  </div>
))