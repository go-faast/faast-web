/* eslint-disable */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Header from 'Site/components/Header'
import EmailSubscriptionForm from 'Site/components/EmailSubscriptionForm'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('IcoIntro'),
)(() => (
  <Fragment>
    <Header/>
    <div className='container my-4'>
      <Card>
        <CardHeader className='font-weight-bold'>
          <h4>An introduction to ICO's</h4>
        </CardHeader>
        <CardBody className='text-muted'>
          <p>An ICO (Initial Coin Offering) is a crowdfunding mechanism by which blockchain assets are sold in exchange for prospective access to services, products, or equity. An individual invests in an idea that they find intriguing, and receives a pre-specified number of digital tokens in return. Once the product launches, these tokens can be exchanged for access to services within the burgeoning platform or community. It is probable that tokens will someday be registered as securities with the SEC. This would allow for the sale of company equity, in addition to service-based rewards. To understand why this is an important advancement, we must look at how far we’ve come in recent years.</p>
          <p>For innovators seeking the capital to accomplish their goals, we are living in a Golden Age of fundraising. As recently as the last decade, budding entrepreneurs were forced to rely on loans, venture capital, and self-funding, to finance their efforts. If fortunate enough to obtain backing from one or more sources, they could expect high interest rates, personal debt, and often a meaningful loss of equity in their company.</p>
          <p>A shift began in the late 2000’s, as crowdfunding websites rose in popularity. These sites made commercial donations available in a way that had never before been globally realized. By allowing anyone with a compelling idea to source funds from their potential customers, projects were no longer beholden to money lenders, or forced to sacrifice their equity. Creators were freed to build uncompromised visions of the future, in exchange for providing small, personal rewards to their contributors.</p>
          <p>Such platforms were not without their flaws, however. Creators could choose to accept funds with only a limited legal obligation to deliver on their promises, leaving investors waiting months or years to see funded ideas come to fruition. Rewards for failed or abandoned projects often never materialized, souring thousands to the once promising innovations championed by crowdfunding advocates.</p>
          <p>Though these problems appeared insurmountable to some, trailblazers within the digital currency community soon began to devise solutions to the apparent problems inherent in traditional crowdfunding campaigns. Using the blockchain to deliver utility-driven digital rewards, producers have begun to acquire project funding, while simultaneously generating liquidity for the individuals investing in their proposals. This nascent method of crowdsourced patronage is called an ICO.</p>
          <p>Similar to traditional crowdfunding, ICO’s take place before development has been completed on a project, and are used as a means of building part or all of the proposed venture. Projects may cap the amount to be raised, or allow for an unlimited investment, with excess funds set aside to provide an open-ended foundation of support. The success of an ICO is largely dependent on the excitement generated within a targeted community. The reward structure differs from that of crowdfunding sites in that the coins and tokens offered during an ICO can be traded for both fiat and digital currency within third party marketplaces, prior to the delivery of the completed project.</p>
          <p>In this way, ICO’s have become a form of investment that holds some expectation of return, rather than mere donation. By allowing for the commutation of reward ownership, investors have the potential to net a worthwhile profit on their investment, thereby creating a speculative market around conceptual products and services.</p>
          <p>A successful enterprise may also experience ongoing prosperity from such assets, long after the initial ICO has concluded. Founders may choose to retain an allocation of their tokens for future use, or to accept them as payment for goods and services. The expenditure of these now-valuable assets provides a secondary source of capital, ensuring unimpeded growth and prosperity as the project continues its development.</p>
          <p>Though presently under regulated, ICO’s and Token-based sales are likely to precipitate efforts of governmental oversight. Until such a time as they are deemed to be legally valid or otherwise, blockchain pioneers will continue to strengthen this new use for their disruptive technology, by virtue of their ongoing support. </p>
          <p>To learn more about ICO’s, Smart Contracts, and Blockchain technology, read on at Faa.st.</p>
        </CardBody>
      </Card>
    </div>
    <EmailSubscriptionForm/>
    <Footer/>
  </Fragment>
))
