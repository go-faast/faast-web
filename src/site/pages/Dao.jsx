/* eslint-disable */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { withRouteData } from 'react-static'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import withTracker from 'Site/components/withTracker'

export default compose(
  setDisplayName('Dao'),
  withTracker,
  withRouteData
)(({ translations }) => (
  <Fragment>
    <Header translations={translations} />
    <div className='container my-4'>
      <Card>
        <CardHeader className='font-weight-bold'>
          <h4>What is a DAO?</h4>
        </CardHeader>
        <CardBody className='text-muted'>
          <p>A DAO, or Decentralized Autonomous Organization, is a leaderless, blockchain-based company that governs a collection of pooled resources using smart contracts. Members of a DAO arbitrate the function of assets within the company by utilizing the power of their individual ballot, as determined by the voting equity they maintain.</p>
          <p>A DAO is joined by acquiring tokens, which give participants status within the community. Each token represents a vote proportional to the amount invested, which are used to decide how money will be spent within the organization. The higher ones stake, the more power they have to influence the community.</p>
          <p>As money flows into invested projects, a percentage of every transaction is sent back to the DAO and its token holders. Participants vote on what percentage of these funds should become profit for individual users, versus the amount that will be returned to the DAO's primary address, where it can be utilized in future proposals.</p>
          <p>Participants vote on contractors to carry out chosen tasks, delivering payment for services rendered on a predetermined schedule. This allows the cutoff of inactive or exploitative contractors at any time. Should a contractor fail to complete their duties, or act against the wishes of the voters, their payment schedule will automatically be terminated. Funds allocated for their undelivered task can then be awarded to a new contractor, as chosen by the voting public. A voting participant who chooses to leave the DAO may recoup any investment which has not already been committed to a proposal. Resources which have already been pledged will continue to profit from the success the projects they fund however, even once the token holder has left the DAO.</p>
          <p>In most cases, a DAO is not 100% code. Curators, nominated by token holders, make certain that contracts published on the blockchain match a contractor's claims. They also control the whitelist of contractors who are authorized to receive compensation from the DAO. Curators do not evaluate proposals, audit smart contract code, provide legal advice, or take responsibility for any proposal therein. Rather than a governing body, they are meant as a fail-safe in the event of an attack on the DAO, but can be hired and fired at any time, by democratic vote.</p>
          <p>DAO’s have implications in nearly all forms of bureaucracy and commerce, and could potentially replace existing infrastructure with demonstrably fair governance models. Questions of how such companies will be regulated continue to persist, as this new category of democratically guided organization begins to take hold. The autonomy of the DAO concept is its true source of ingenuity, and comes with the promise of a leaderless future, regulated only by the wisdom of its participants.</p>
        </CardBody>
      </Card>
    </div>
    <Footer translations={translations} />
  </Fragment>
))
