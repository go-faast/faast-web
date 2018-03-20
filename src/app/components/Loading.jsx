import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import faastLogo from 'Img/faast-logo.png'
import Spinner from 'Components/Spinner'

const Loading = ({ tag: Tag, error, center, className, ...props }) => (
  <Tag className={classNames('d-flex flex-column align-items-center', { 'm-auto': center }, className)} {...props}>
    <img src={faastLogo} height='50' className='mb-3' />
    {error
      ? (<div className='text-danger'>{error}</div>)
      : (<Spinner size='lg'/>)}
  </Tag>
)

Loading.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  error: PropTypes.string,
  center: PropTypes.bool,
}

Loading.defaultProps = {
  tag: 'div',
  error: '',
  center: false,
}

export default Loading
