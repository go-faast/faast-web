import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { Row, Col, Button } from 'reactstrap'

import {
  getAccountSearchError, getAccountSearchPending, getAccountSearchResultWalletWithHoldings,
  isAccountSearchResultWalletInPortfolio,
} from 'Selectors'
import { searchAddress, viewInPortfolio, addToPortfolio } from 'Actions/accountSearch'

import Layout from 'Components/Layout'
import Balances from 'Components/Balances'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import ShareButton from 'Components/ShareButton'

const getQuery = ({ match }) => match.params.addressQuery

export default compose(
  setDisplayName('SearchResults'),
  setPropTypes({
    match: PropTypes.object.isRequired
  }),
  connect(createStructuredSelector({
    error: getAccountSearchError,
    pending: getAccountSearchPending,
    wallet: getAccountSearchResultWalletWithHoldings,
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio,
  }), {
    search: searchAddress,
    handleAddToPortfolio: addToPortfolio,
    handleViewInPortfolio: viewInPortfolio,
  }),
  lifecycle({
    componentWillMount () {
      this.props.search(getQuery(this.props))
    },
    componentWillReceiveProps (nextProps) {
      const currentQuery = getQuery(this.props)
      const nextQuery = getQuery(nextProps)
      if (currentQuery !== nextQuery) {
        this.props.search(nextQuery)
      }
    }
  })
)(({ pending, error, wallet, handleViewInPortfolio, handleAddToPortfolio, isAlreadyInPortfolio }) => (
  <Layout className='pt-3'>
    {(pending || error || !wallet) ? (
      <LoadingFullscreen center error={error}/>
    ) : (
      <Row className='gutter-3 align-items-end'>
        <Col>
          <h4 className='m-0 text-primary'>{wallet.label}</h4>
        </Col>
        <Col xs='auto'>
          <ShareButton wallet={wallet}/>
        </Col>
        <Col xs='auto'>
          {isAlreadyInPortfolio ? (
            <Button size='sm' color='primary' onClick={handleViewInPortfolio}>
              View in portfolio
            </Button>
          ) : (
            <Button size='sm' color='primary' onClick={() => handleAddToPortfolio('dashboard')}>
              Add to portfolio
            </Button>
          )}
        </Col>
        <Col xs='12'>
          <Balances wallet={wallet} />
        </Col>
      </Row>
    )}
  </Layout>
))
