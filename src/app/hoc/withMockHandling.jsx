import React, { Component } from 'react'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { setMock } from 'Actions/redux'
import { uppercase, lowercase } from 'Utilities/helpers'
import { getAllAssetsArray } from 'Selectors'

const withMockHandling = (Wrapped) => {
  class Mock extends Component {
    constructor () {
      super()
      const query = queryString.parse(window.location.search)
      this.state = {
        mocking: query && query.mock === 'true'
      }
    }

    componentWillMount () {
      const assets = this.props.assets
      const query = queryString.parse(window.location.search)
      if (window.faast.dev && query && query.mock === 'true') {
        const mockObj = {}
        Object.keys(query).forEach((q) => {
          if (q.includes('_')) {
            const qSymbol = uppercase(q.slice(0, q.indexOf('_')))
            const qAction = lowercase(q.slice(q.indexOf('_') + 1))
            if (assets.some((a) => a.symbol === qSymbol)) {
              if (!mockObj[qSymbol]) mockObj[qSymbol] = {}
              mockObj[qSymbol][qAction] = query[q]
            }
          } else if (q === 'hw') {
            if (!mockObj.hasOwnProperty('hw')) mockObj.hw = []
            mockObj.hw = mockObj.hw.concat(query[q].split(','))
          }
        })
        this.props.setMock(mockObj)
      }
    }

    render () {
      return <Wrapped mocking={this.state.mocking} {...this.props} />
    }
  }

  const mapStateToProps = (state) => ({
    assets: getAllAssetsArray(state),
  })

  const mapDispatchToProps = (dispatch) => ({
    setMock: (mock) => {
      dispatch(setMock(mock))
    }
  })

  return connect(mapStateToProps, mapDispatchToProps)(Mock)
}

export default withMockHandling
