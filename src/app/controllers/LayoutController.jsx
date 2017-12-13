import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Layout from 'Views/Layout'
import {setMediaQueries} from '../actions/redux'
import { connect } from 'react-redux'
import withMockHandling from '../hoc/withMockHandling'

const widths = new Map()
widths.set('sm', '(min-width: 768px)')
widths.set('md', '(min-width: 992px)')
widths.set('lg', '(min-width: 1200px)')

class LayoutController extends Component {
  constructor () {
    super()
    this.state = {
      mq: {
        sm: true,
        md: true,
        lg: true
      }
    }
    this._mediaQueryChange = this._mediaQueryChange.bind(this)
  }

  componentDidMount () {
    widths.forEach((value, key) => {
      this._mediaQueryChange(window.matchMedia(value), key)
      window.matchMedia(value).addListener((e) => { this._mediaQueryChange(e, key) })
    })
  }

  _mediaQueryChange (mediaQuery, type) {
    this.setState({ mq: Object.assign({}, this.state.mq, { [type]: mediaQuery.matches }) })
  }

  render () {
    return (
      <Layout {...this.props}>{this.props.children}</Layout>
    )}
}

LayoutController.propTypes = {
  children: PropTypes.node.isRequired
}

const mapStateToProps = (state) => ({
  mq: state.setMediaQueries
})

const mapDispatchToProps = (dispatch) => ({
  setMediaQueries: (mq) => {
    dispatch(setMediaQueries(mq))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(withMockHandling(LayoutController))
