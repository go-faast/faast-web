import React from 'react'
import Loading from 'Views/Loading'

const LoadingController = (props) => (
  <Loading showSpinner={!props.hasError} />
)

export default LoadingController
