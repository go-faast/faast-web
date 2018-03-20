import React from 'react'
import Overlay from 'Components/Overlay'
import Loading from 'Components/Loading'

const LoadingFullscreen = (props) => (
  <Overlay>
    <Loading center {...props}/>
  </Overlay>
)

LoadingFullscreen.propTypes = Loading.propTypes

export default LoadingFullscreen
