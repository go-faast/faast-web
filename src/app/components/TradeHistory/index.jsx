import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers } from 'recompose'
import { getAllSwapsArray } from 'Selectors/swap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Layout from 'Components/Layout'
import TradeTable from 'Components/TradeTable'


const TradeHistory = ({ allSwapsArray }) => {
  return (
    <Layout className='pt-3'>
      <h4 className='mt-2 text-primary'>Trade History</h4>
      <TradeTable swaps={allSwapsArray}/>
    </Layout>
  )
}

export default compose(
    setDisplayName('TradeHistory'),
    connect(createStructuredSelector({
      allSwapsArray: getAllSwapsArray
    }), {
    }),
    setPropTypes({
    }),
    defaultProps({
    }),
    withHandlers({
    }),
    lifecycle({
      componentDidMount() {
      }
    }),
  )(TradeHistory)