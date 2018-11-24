import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Header from 'Site/components/Header'

export default compose(
  setDisplayName('Pricing'),
)(() => (
  <Fragment>
    <Header/>
    <div className="container-fluid pricing-page">
      <div className="container text-center">
        <div className="page-info">
          <div className="page-title">pricing</div>
          <div className="page-desc">faast is the cheapest way to <b>instantly</b> exchange crypto currencies</div>
        </div>

        <div className="content-tile">
          <div className="faast-opt-icon"></div>
          <div className="content-title">optimized transactions</div>
          <div className="content-desc">faast portfolio intelligently optimizes transactions. This allows diversification with the <b>minimum number</b> of transactions and fees.</div>
        </div>

        <div className="content-tile">
          <div className="content-desc">Here is an example transaction confirmation which clearly indicates transaction fees.</div>
          <div className="content-screenshot"></div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="content-tile">
              <div className="content-title">swap fee</div>
              <div className="content-desc">A <b>0.5%</b> swap fee is applied on each side while swapping between two cryptocurrencies.</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="content-tile">
              <div className="content-title">exchange rate</div>
              <div className="content-desc">Exchange rates are based on <b>real-time market data</b>. Large orders are priced based on market depth.</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="content-tile">
              <div className="content-title">network fees</div>
              <div className="content-desc">Network fees are charged on deposits and withdrawals. These fees are <b>paid to miners, not faast.</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Fragment>
))