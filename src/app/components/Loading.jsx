import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { tag as tagPropType } from 'Utilities/propTypes'
import faastLogo from 'Img/faast-logo.png'
import Spinner from 'Components/Spinner'

const Loading = ({ tag: Tag, label, error, center, className, errorButton: ErrorButton, ...props }) => (
  <Tag className={classNames('d-flex flex-column align-items-center', { 'm-auto': center }, className)} {...props}>
    <img src={faastLogo} height='50' className='mb-3' />
    {error
      ? (
        <div>
          <div className='text-danger'>
            {error}
          </div>
          {ErrorButton}
        </div>
      )
      : (
        <Fragment>
          <Spinner size='lg'/>
          {label && (
            <div className='mt-3'>{label}</div>
          )}
        </Fragment>
      )}
  </Tag>
)

Loading.propTypes = {
  tag: tagPropType,
  label: PropTypes.node,
  error: PropTypes.string,
  center: PropTypes.bool,
  errorButton: PropTypes.node
}

Loading.defaultProps = {
  tag: 'div',
  label: '',
  error: '',
  center: false,
}

export default Loading
