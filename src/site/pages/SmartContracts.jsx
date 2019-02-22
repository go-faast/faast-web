import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Header from 'Site/components/Header'
import EmailSubscriptionForm from 'Site/components/EmailSubscriptionForm'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('SmartContracts'),
)(() => (
  <Fragment>
    <Header/>
    <div className='container my-4'>
      <Card>
        <CardHeader className='font-weight-bold'>
          <h4>What are Smart Contracts?</h4>
        </CardHeader>
        <CardBody className='text-muted'>
          <p>Smart Contracts are single purpose applications that are capable of self-executing, without the need for human arbitration. A smart contract can be used as a stand alone function, or in sequence with many other smart contracts, in order to form larger applications.</p>
          <p>When two parties enter into a legal engagement, they each sign a contract that binds them by law to the terms described therein. In the event that one of the parties fails to uphold the terms of the contract, they can be summoned before a judge to civilly determine any compensation that may be owed. This often becomes an arduous process, rife with human error, that is unlikely to end amicably for either party. As the terms of a contract are reliant on semantics and legal interpretation, failure to fully define the consequences of not meeting specified conditions could lead to a contract being nullified entirely.</p>
          <p>Smart Contracts, or autonomous agents, act similarly to this traditional arrangement, except that instead of being governed by the laws of a courtroom, they are enforced via cryptography. When the parameters defined by a smart contract have been fulfilled, the agreement will self-execute without requiring further human input or litigation. Terms of a smart contract that have been mutually agreed upon become fully governed and executable by the underwritten code.</p>
          <p>This allows for trustless interaction, which expels all need for moderative third parties, such as lawyers and financial intermediaries. Using smart contracts, individuals can agree to an exchange of goods or services, without fearing a reversal of intent on the part of the vendor with whom they are entering the deal. Some blockchain smart contracts, such as those based on Ethereum, can be programmed to complete a hefty variety of tasks, thanks to a Turing-complete scripting language that provides developers with a broad set of computational strictures. Some examples of these tasks include storing records of ownership, acting as an escrow for financial services, or even the bundling together of smart contracts to build larger, self-operating applications, known as Dapps.</p>
          <p>Blockchain smart contracts rely on an a decentralized public ledger, which is updated by transferring the ownership of unique, tokenized data packets. Participants use these tokens to create and join smart contracts, as well as to award fees to individuals operating the nodes that are used to authenticate and record each transaction. A public ledger records the current state and history of every smart contract on the network, making it impossible to alter the data stored therein without enacting a hostile takeover of thousands of nodes.</p>
          <p>The term “Smart Contract” was coined in the early 1990’s by computer scientist Nick Szabo. A respected legal scholar and cryptographer, Szabo saw smart contracts as a means to satisfy common contractual conditions at a reasonable cost, while minimizing the possible influence of unscrupulous entities. The significance of his ideas would not be actualized for nearly two decades however, as trustless interaction between parties proved a difficult ambition to quantify. With the conceptualization of Blockchain technology in 2008, issues pertaining to faith-based transactions were at last assuaged, making smart contracts a viable consideration for the future of automated cooperation.</p>
          <p>Trustless, self-executing contracts allow us to transact safely around the globe, while eliminating the single point of failure-based systems upon which the world has operated for centuries. Smart contracts are changing the way people think about person-to-person mediation, and opening the door a little wider as we head towards a fully decentralized future. If such technology continues to be rapidly adopted, it has the potential to positively disrupt how agreements are upheld across every industry.</p>
        </CardBody>
      </Card>
    </div>
    <EmailSubscriptionForm/>
    <Footer/>
  </Fragment>
))
