/* eslint-disable */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { withRouteData } from 'react-static'
import withTracker from 'Site/components/withTracker'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('BuyEthereum'),
  withTracker,
  withRouteData
)(({ translations }) => (
  <Fragment>
    <Header translations={translations} />
    <div className='container my-4'>
      <Card>
        <CardHeader className='font-weight-bold'>
          <h4>How to Buy Ethereum</h4>
        </CardHeader>
        <CardBody className='text-muted'>
          <p>As the excitement over smart contracts has risen, aspirations in regards to Ethereum's future value have likewise continued to expand. Ether, the fuel upon which Ethereum is run, has become a highly sought after speculative commodity. In the three years since its inception, Ethereum prices have risen 10,000%, making it one of the most successful investments of the past decade. While scarce by design, access to Ether has additionally been truncated by its difficulty of acquisition.</p>
          <p>Anyone owning Bitcoin, or other popular Blockchain currencies, can easily trade their coins for Ether via exchanges such as Poloniex, or services such as Shapeshift.io. What about investors how do not already possess significant holdings of digital currency, however? Buying Ethereum with cash or bank card has long been a point of contention within the digital currency community. For some though, a worthy solution now exists.</p>
          <p>Canadian residents with access to a Bitaccess.co account may purchase Ether effortlessly via Interac e-Transfer; a convenient, fast, and secure way to send and receive money online. Please do note that Bitaccess does not accept co-badged cards as Interac payment. </p>
          <p>Using only an email or mobile number for verification, Ether can be purchased directly via your account at Bitaccess.co. To begin, login to or register your Bitaccess account. You are not required to provide an ID or personal details beyond your name, email, and mobile number, unless the amount you are buying is in excess of specified thresholds. Next, select ‘Buy’ at the top of the leftside menu.</p>
          <p>Under payment, choose ‘Interac’, and then enter the amount that you would like to purchase. You will be asked to input your Ethereum address. If you do not yet have an Ethereum wallet or address, you can set one up by following along with our instructions here. Once you have entered your Ethereum address, click ‘Submit’. You will next be prompted to enter your Interac email. Afterwards, choose your financial institution or credit union from the supplied list.</p>
          <p>When encouraged to do so, signin to your Interac account, choose the correct amount to send, and click ‘Continue’. A payment overview will appear, displaying your order for confirmation. Make certain that all of your payment details are correct, and then click ‘Confirm’. You will be returned to the Bitaccess order page, and asked to confirm one final time. Once your invoice has been paid, your order will be sent to Bitaccess for processing. After payment has been verified, your Ether will be instantly delivered to your wallet.</p>
          <p>Now that you have Ether of your very own, you may choose to use it to initiate your own smart contracts, to trade in payment for goods and services, or even to hold indefinitely, in anticipation of a continued rise in price. Though Ethereums ultimate monetary value remains unquantifiable, the value of its utility becomes more appreciable everyday.</p>
          <p>Ethereum and smart contract technologies have the capacity to alter industries, businesses, and services around the world. The underlying technology is likely to improve the lives of individuals for generations to come. For the present, it is unknown whether the price of Ether will continue to rise in step with Ethereums’ global adoption. We do know though that those who have banked on Ethereum in the past have possessed an undeniable advantage that has dwarfed many of the world market's best performing investments during the course of its historic run.</p>
        </CardBody>
      </Card>
    </div>
    <Footer translations={translations} />
  </Fragment>
))
