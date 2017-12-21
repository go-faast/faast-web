import React from 'react'
import LoadingView from './view'

const Loading = (props) => (
  <LoadingView showSpinner={!props.hasError} />
)

export default Loading
