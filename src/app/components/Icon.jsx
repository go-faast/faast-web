import React from 'react'
import PropTypes from 'prop-types'
import { reduceStyles, resize, rotate, fill } from 'Utilities/style'
import { tag as tagPropType } from 'Utilities/propTypes'

const Icon = ({ src, tag: Tag, width, height, size: scale, rotate: rotation, color: fillColor, style, ...props }) => {
  if (typeof src === 'string') {
    if (Tag === 'img') {
      props = { src, ...props }
    } else {
      style = { backgroundImage: `url(${src})`, ...style }
    }
  } else {
    Tag = src
  }
  return (
    <Tag style={reduceStyles(
        { width, height },
        resize(scale),
        rotate(rotation),
        fill(fillColor),
        style
      )}
      {...props}
    />
  )
}

Icon.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, tagPropType]).isRequired, // Resource URL or component (e.g. from svg-react-loader)
  tag: tagPropType, // Component/HTML tag to render as
  width: PropTypes.string, // Valid css unit (2rem, 16px, etc)
  height: PropTypes.string, // Valid css unit (2rem, 16px, etc)
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Width/height scale factor or abbreviation (sm, md, lg)
  rotate: PropTypes.string, // Degrees (90deg, 135deg, etc) or direction (up, right, down, left)
  color: PropTypes.string, // Hex color (#123abc) or theme-color (primary, success, grey, etc). Only applies if src from svg-react-loader
  style: PropTypes.object
}

Icon.defaultProps = {
  tag: 'img',
  width: '1rem',
  height: '1rem',
  size: 1,
  rotate: null,
  color: null
}

export default Icon