import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Header from 'Site/components/Header'
import { withRouteData } from 'react-static'
import Footer from 'Site/components/Footer'
import withTracker from 'Site/components/withTracker'

export default compose(
  setDisplayName('IcoItoIpo'),
  withTracker,
  withRouteData
)(({ translations }) => {
  return (
    <Fragment>
      <Header translations={translations} />
      <div className='container my-4'>
        <Card>
          <CardHeader className='font-weight-bold'>
            <h4>What is the difference between an ICO, ITO and IPO</h4>
          </CardHeader>
          <CardBody className='text-muted'>
            <div>
              <div>
                <h5 className='text-white font-weight-bold'>Blockchain</h5>
                <p>As use-cases for Blockchain technology continue to emerge, the substance of established terminology often becomes muddled. Such is the case for the crowd sourced funding options that have recently gained momentum within the Bitcoin community. While at times ambiguous, we will attempt to delineate all apparent differences for the benefit of the uninitiated.</p>
              </div>
              <div>
                <h5 className='text-white font-weight-bold'>IPO</h5>
                <p>An IPO, or Initial Public Offering, refers to the earliest issuance of stock that a company offers to the public. Once an IPO has taken place, the company is thereafter categorized as a publicly traded venture, with their assets available for purchase via a registered stock exchange. Stocks offered in an IPO are considered to be securities, and are highly regulated across every continent. The process of launching an IPO is an extensive undertaking, involving professional legal guidance, and months of prep work. This culminates in the eventual oversight, audit, and approval of company equity as an item of value and exchange.</p>
                <p>IPO’s are not specific to blockchain companies, and are one of the oldest forms of public equity ownership in the industrialized world.</p>
              </div>
              <div>
                <h5 className='text-white font-weight-bold'>ICO</h5>
                <p>An Initial Coin Offering (ICO) is a public or private crowdfunding event that allows a team to propose a conceptual project, and obtain funding for its development in exchange for utility-based digital assets. These assets are awarded under the pretense that they will have some imminent value in exchange for services within a soon-to-be funded platform. While the reward of these assets does not directly grant equity in the prospective company, it does engender an ecosystem of commutable ownership. Benefactors may trade a companys’ given coin in exchange for both fiat and digital currencies on a global scale via third-party marketplaces.</p>
                <p>In most cases, such an asset does not constitute a security, and offers no liability, nor guarantee of return. Coins offered in an ICO are meant as a digital redress of the physical rewards offered on traditional crowdfunding sites. Unlike traditional crowdfunding rewards, ownership of digitally offered coins are made malleable prior to the delivery of a fully realized project or platform. Liquidity is established by this transposition of ownership, thereby creating a speculative market around conceptual products and services.</p>
              </div>
              <div>
                <h5 className='text-white font-weight-bold'>ITO</h5>
                <p>Although Initial Token Offerings (ITOs) are broadly synonymous with Initial Coin Offerings (ICOs), a variety of subtle variances in nomenclature may be acknowledged. A ‘Coin’ may be perceived to have specific connotations with money, or the exchange of the asset for goods and services. Alternatively, ‘Tokens’ often reference a permission-based asset, meant to provide access to privileges or features within a community, without primarily acting as a means to facilitate monetary exchange.</p>
                <p>For instance, Token ownership may indicate membership within a group, demonstrate permissible access to media-centric content, provide accessibility to characters or items within a game, or even act as verifiable, identity-based endorsement within the internet of things.</p>
                <p>Though differences between ‘tokens’ and ‘coins’ do exist, it is considered acceptable to use the terms interchangeably within the context of a crowdsale. The future of this thriving technology will continue to be made apparent as its prosperity endures. The sale of such digital property may someday even be seen as synonymous with the classic IPO infrastructure, upon which much of the modern world has been established.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      <Footer translations={translations} />
    </Fragment>
  )})
