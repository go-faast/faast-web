/* eslint-disable */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Header from 'Site/components/Header'
import { withRouteData } from 'react-static'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('WhatIsEthereum'),
  withRouteData
)(({ translations }) => (
  <Fragment>
    <Header translations={translations} />
    <div className='container my-4'>
      <Card>
        <CardHeader className='font-weight-bold'>
          <h4>What is Ethereum?</h4>
        </CardHeader>
        <CardBody className='text-muted'>
          <p>Ethereum is a networked creation platform whose tools are used to design and host decentralized applications via the Blockchain. It is a disruptive technology, meant to improve the existing data storage infrastructure upon which the internet is built.</p>
          <p>Across the modern world, the internet has improved standards of living and education for millions of people. Near-instantaneous communication has revolutionized how we consume all forms of media, from daily newsprint to basic cable. A simple search is able to provide connected persons with access to a world class education on nearly any conceivable subject. Networking via popular social sites has fostered an environment of direct connectivity that operates unhindered by distances between corresponding individuals.</p>
          <p>Beneath this veneer of convenience and the promise utility however, undesirable forces have festered for decades unobstructed. Privacy has slowly become a relic of the past, as data mining has turned people into commodities to be exploited. Bad actors with access to the right skills and toolsets are able to annex an individual's personal data for their own means. Governments the world over have levied our reliance on connected technology as a means of monitoring their own citizenry in perpetuity.</p>
          <p>For decades, these remained problems for which no reasonable solution had been conceived. Due to how the internet was designed, no simple fix could be orchestrated that would return singular control over personal data to its progenitor. The internet, which operates as an interconnected network of computers, relies significantly upon storing your data on machines owned by other people. The convenience provided by centralizing this data ultimately left it vulnerable to failure and exploitation.</p>
          <p>Ethereum’s goal is to supplant each of the centralized third parties with whom our trust has been misplaced, thereby democratizing the existing client-server model via data decentralization. The servers upon which the internet currently runs would be replaced by hundreds of thousands of nodes, operated by volunteers within Ethereum’s network. Such a system returns the control over personal data to its owner, while simultaneously leaving censorship outmoded and preventing attempted access by unauthorized parties.</p>
          <p>Ethereum runs on a decentralized public ledger known as a Blockchain, which is updated through the disbursement and receipt of unique data packets, christened Ether. Individuals store Ether in an account called an Ethereum wallet, which is accessible only by an account's primary owner. Participants then use their Ether to either create or join simple, self-executing functions known as Smart Contracts.</p>
          <p>A Smart Contract is a piece of code that self-executes once the parameters of the contract have been fulfilled. Smart contracts remove the need for centralized third parties by placing control over specified outcomes under the competency of machine-based automation. Batches of smart contracts can be run in tandem to create an infinite variety of decentralized applications, known as dapps.</p>
          <p>Dapps, or Decentralized applications, are reliant upon data delivered via incoming feeds of verifiable information called Oracles. It is the job of an Oracle to relay accurate intelligence, relevant to the contents of a Dapp, in a timely and effective manner. If the information conveyed by an Oracle reflects the completion of one or more necessary parameters of a particular smart contract, the Dapp will then execute.</p>
          <p>Each time a Dapp operates a function, it’s current state is confirmed via network consensus, and recorded across all nodes. A complete history of all executed contracts is recorded and eternally maintained by the network. This makes it impossible to control the outcome of a dapp, or alter the data stored therein, without enacting a hostile takeover of each of the thousands of nodes that actively propagate Ethereums network; an extraordinarily improbable feat.</p>
          <p>Dapp’s exist in varying forms, determined by their core functionality. Variations outlined by the Ethereum whitepaper include Dapps that manage money, Dapps that manage permissible data, and Dapps that, at the time, had not yet been thoroughly defined, such as the governance systems upon which autonomous organizations are operated.</p>
          <p>Though Ethereum is in its infancy, many believe that the underlying technology has the potential to impact the dissemination and control of data on a global scale. Ethereum has laid the groundwork to disrupt financial institutions, political systems, and most notably the function of the internet itself. The dream of personal privacy and security, as bolstered by Ethereum smart contracts, will continue to flourish as our decentralized future unfolds.</p>
        </CardBody>
      </Card>
    </div>
    <Footer translations={translations} />
  </Fragment>
))
