import React from 'react'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { loginMaker } from 'Actions/maker'

import { withAuth } from 'Components/Auth'
import LoadingFullScreen from 'Components/LoadingFullscreen'

import { text } from '../style'

const MakerLoading = () => {
  return (
    <LoadingFullScreen bgColor='#fff' label={<span className={text}>Loading Maker Stats...</span>} />
  )
}

export default compose(
  setDisplayName('MakerLoading'),
  withAuth(),
  connect(createStructuredSelector({
  }), {
    push: push,
    loginMaker
  }),
  lifecycle({
    componentDidMount() {
      const { loginMaker } = this.props
      console.log('htllooooo')
      loginMaker()
        .then(() => {
          push('/makers/dashboard')
        })
        .catch(() => {
          push('/makers/login')
        })
    },
  })
)(MakerLoading)
