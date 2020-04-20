/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { compose, setDisplayName, withState, withHandlers, lifecycle } from 'recompose'
import { withRouteData } from 'react-static'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import withTracker from 'Site/components/withTracker'
import Header from 'Site/components/Header'
import { updateQueryStringReplace } from 'Actions/router'
import * as qs from 'query-string'
import Footer from 'Site/components/Footer'
import { Input, Container, InputGroup, InputGroupButtonDropdown, 
  DropdownToggle, DropdownMenu, DropdownItem, Button, InputGroupAddon } from 'reactstrap'
import ReactJson from 'react-json-view'
import classNames from 'class-names'

import { getSwapsByAddress, getSwapByOrderId } from 'Common/actions/swap'

import style from './style.scss'

export default compose(
  setDisplayName('LawEnforcement'),
  withTracker,
  withRouteData,
  connect(createStructuredSelector({
  }), {
    getSwapsByAddress,
    getSwapByOrderId,
    updateQueryString: updateQueryStringReplace
  }),
  withHandlers({
    checkQueryParams: () => () => {
      const urlParams = qs.parse(location.search)
      return urlParams
    },
  }),
  withState('shareableURL', 'updateShareableURL', ''),
  withState('query', 'updateQuery', ({ checkQueryParams }) => {
    const { q } = checkQueryParams()
    return q
  }),
  withState('searchType', 'updateSearchType', ({ checkQueryParams }) => {
    const { type } = checkQueryParams()
    return type || 'address'
  }),
  withHandlers({
    updateURLParams: ({ updateQueryString }) => (params) => {
      updateQueryString(params)
    },
    handleShareableURL: ({ updateShareableURL, query, searchType }) => () => {
      if (typeof window !== 'undefined') {
        updateShareableURL(`${window.location.href}?q=${query}&type=${searchType}`)
      }
    }
  }),
  withState('dropdownOpen', 'toggleDropDown', false),
  withState('json', 'updateJSON', undefined),
  withState('isLoading', 'updateLoading', false),
  withState('previousSearch', 'updatePreviousSearch', undefined),
  withHandlers({
    handleRetrieveData: ({ searchType, updateLoading, updateJSON, getSwapsByAddress, 
      getSwapByOrderId, query, updatePreviousSearch, handleShareableURL }) => async () => {
      let json
      updateLoading(true)
      updateJSON(undefined)
      if (searchType === 'address') {
        json = await getSwapsByAddress(query)
        handleShareableURL()
      } else {
        json = await getSwapByOrderId(query)
      }
      updateJSON(json)
      updateLoading(false)
      updatePreviousSearch(query)
    }
  }),
  lifecycle({
    componentDidMount() {
      const { checkQueryParams, updateQuery, updateSearchType, handleRetrieveData } = this.props
      const { q, type } = checkQueryParams()
      if (q && type) {
        updateQuery(q)
        updateSearchType(type)
        handleRetrieveData()
      }
    }
  })
)(({ translations, dropdownOpen, toggleDropDown, searchType, updateSearchType, query, updateQuery,
  handleRetrieveData, json, isLoading, previousSearch, shareableURL }) => (
  <Fragment>
    <Header translations={translations} headerColor='#1845a0' />
    <div className='jumbotron jumbotron-fluid hero-technology mb-0 pb-5' style={{ 
      backgroundColor: '#1845a0',
      minHeight: '85vh',
      height: '100%',
      backgroundPosition: '50% 25px',
      backgroundSize: '1400px',
      backgroundRepeat: 'no-repeat',
    }}>
      <Container>
        <h1 style={{ fontWeight: 600 }} className='mb-3 mt-3'>Faa.st is a non-custodial peer-to-peer crypto trading platform</h1>
        <h4 className='mb-2' style={{ color: '#bcd2ff' }}>
        All transaction on the Faa.st platform is publicly searchable through the <a href='https://api.faa.st' target='_blank noreferrer'>Faa.st API</a>. Faa.st takes fraud very seriously, and actively collaborates with companies and agencies to prevent and track any and all forms of fraud.
        Use the search box below to determine if a crypto address is related to a Faa.st transaction.
        </h4>
        <InputGroup className='mx-auto mt-5' style={{ maxWidth: 700 }}>
          <Input type='search' value={query} onChange={(e) => updateQuery(e.target.value)} style={{ height: 60 }} className={style.input} placeholder={searchType === 'address' ? 'Enter a wallet address...' : 'Enter an order ID...'} />
          {query ? (
            <InputGroupAddon addonType='append'>
              <Button onClick={handleRetrieveData} color='primary'>{!isLoading ? `Search for ${searchType}` : 'Loading...'}</Button>
            </InputGroupAddon>
          ) : (
            <InputGroupButtonDropdown addonType='append' isOpen={dropdownOpen} toggle={() => toggleDropDown(!dropdownOpen)}>
              <DropdownToggle color='light' className={style.inputButton} caret>
                {searchType === 'address' ? 'Search by address' : 'Search by order ID'}
              </DropdownToggle>
              <DropdownMenu color='light' className={classNames('text-dark', style.inputButton)}>
                {searchType === 'address' ? (
                  <DropdownItem onClick={() => updateSearchType('order ID')} className={style.inputMenu}>
               Search by order ID
                  </DropdownItem>
                ) : (
                  <DropdownItem onClick={() => updateSearchType('address')} className={style.inputMenu}>
                Search by address
                  </DropdownItem>
                )}
              </DropdownMenu>
            </InputGroupButtonDropdown>
          )}
        </InputGroup>
        <p className='text-small mt-3' style={{ color: '#bcd2ff' }}>
          <small>If you have any questions related to a transaction which may be the result of fraud, please contact <a href='mailto:security@faa.st'>security@faa.st</a> for assistance.</small>
        </p>
        {json && (
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 4, 
              boxShadow: '0 4px 6px rgba(0,0,0,.25)',
            }} 
            className='text-left p-4 mt-5'
          >
            <h3 className='text-dark'>Results <a href={searchType === 'address' ? `https://api.faa.st/api/v2/public/swaps?withdrawal_address=${previousSearch}&refund_address=${previousSearch}&limit=100` : `https://api.faa.st/api/v2/public/swaps/${query}`} target='_blank noreferrer'>(Full API Response)</a></h3>
            <p className='text-dark mb-4'><small>Shareable url: {shareableURL}</small></p>
            <div style={{ maxHeight: 400, overflow: 'scroll' }}>
              <ReactJson src={json} theme='rjv-default' collapsed={2} iconStyle='circle' />
            </div>
          </div>
        )}
      </Container>
    </div>
    <Footer translations={translations} showEmail={false} />
  </Fragment>
))
