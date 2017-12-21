import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {setMediaQueries} from '../../actions/redux'
import { connect } from 'react-redux'
import withMockHandling from '../../hoc/withMockHandling'
import LayoutView from './view'

const widths = new Map()
widths.set('smPh', '(max-width: 320px)')
widths.set('mdPh', '(max-width: 375px)')
widths.set('lgPh', '(max-width: 425px)')
widths.set('sm', '(min-width: 768px)')
widths.set('md', '(min-width: 992px)')
widths.set('lg', '(min-width: 1200px)')

class Layout extends Component {
  constructor () {
    super()
    this._mediaQueryChange = this._mediaQueryChange.bind(this)
  }

  componentDidMount () {
    widths.forEach((value, key) => {
      this._mediaQueryChange(window.matchMedia(value), key)
      window.matchMedia(value).addListener((e) => { this._mediaQueryChange(e, key) })
    })
  }

  _mediaQueryChange (mq, type) {
    this.props.setMediaQueries({ [type]: mq.matches })
  }

  render () {
    return (
      <LayoutView {...this.props}>{this.props.children}</LayoutView>
    )}
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

const mapStateToProps = (state) => ({
  mq: state.mediaQueries
})

const mapDispatchToProps = (dispatch) => ({
  setMediaQueries: (mq) => {
    dispatch(setMediaQueries(mq))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(Layout))
