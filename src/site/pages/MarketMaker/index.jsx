/* eslint-disable */
import * as React from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { withRouteData } from 'react-static'
import { Row, Col, Button, Container, Card, CardBody, Collapse } from 'reactstrap'
import withTracker from 'Site/components/withTracker'

import CoinIcon from 'Components/CoinIcon'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer1'
import Terminal from 'Site/components/Terminal'
import MakerBg from 'Img/maker-bg.svg'
import MakerSetup from 'Img/maker-setup.svg?inline'
import MakerSetupMobile from 'Img/maker-setup-mobile.svg?inline'
import StackedCoins from 'Img/stacked-coins.svg?inline'
import HowFaastWorks from 'Img/how-faast-works.svg?inline'
import HowFaastWorksMobile from 'Img/how-faast-works-mobile.svg?inline'
import BitcoinLogo from 'Img/newsletter-btc.svg'
import EthereumLogo from 'Img/newsletter-eth.svg'
import LitecoinLogo from 'Img/newsletter-ltc.svg'
import { eth, ltc, btc, line, coinContainer } from '../NewsletterLanding/style.scss'

import { retrieveAssets } from 'Common/actions/asset'

import classNames from 'class-names'

import { blobs, blob, faq, numbers, subtitle, why, textContainer, sectionContainer, shadowLight,
  sectionIntro, sectionTitle, sectionDescription, sectionLink, shadow, stackGradient, link, heroTitle } from './style.scss'
import homeStyle from '../Home1/style.scss'
import { className } from 'Src/utilities/reflect'

const blueColor = '#323540'

export const popularCoins = ['BTC', 'ETH', 'LTC', 'USDC', 'YFI', 'UNI']

export default compose(
  setDisplayName('MarketMaker'),
  withTracker,
  withRouteData,
  connect(createStructuredSelector({
  }), {
    retrieveAssets,
  }),
  lifecycle({
    componentWillMount() {
      const { retrieveAssets } = this.props
      retrieveAssets()
    }
  }),
)(({ translations = {}, translations: { static: { marketMaker: t } } }) => {
  const faqCopy = [
    {
      q: 'Why Become a Market Maker?',
      a: <div>
        <p>Running a market maker node allows you to fulfill swaps on the Faa.st network. In return, you can earn liquidity rewards.</p>
        <p>In the early days, earning Bitcoin was as simple as downloading the node software and mining on your computer. Mining cryptocurrency is now a highly specialized industry, without much room for independent peers. With the emergence of DeFi, a new form of mining has emerged: Liquidity mining.</p>
      </div>,
    },
    {
      q: 'What is Liquidity Mining?',
      a: <div>
        <p>Liquidity mining is a community based approach to market making. A market maker (or Liquidity provider) enables markets to operate by pulling supply from different sources to ensure efficient prices. In return, market makers tend to earn a rewards when regular trades (also known as market takers) place market trades.</p>
        <p>Liquidity mining is <b>automated market making.</b> Instead of manually making trades and writing scripts, you download an open-source application which automates all of this for you. All you need to do is configure the application, and keep an eye on your accounts to make sure they're all running fine.</p>
      </div>,
      id: 'liquiditymining'
    },
    {
      q: 'Is Faa.st Regulated?',
      a: <p>Faa.st is a bulletin board to connect two cryptocurrency users who then trade themselves. Faa.st's  design has taken consideration to the <a target='_blank' href='https://www.fatf-gafi.org/media/fatf/documents/recommendations/RBA-VA-VASPs.pdf'>2019 FATF Guidance - Section 39.</a> Faa.st provides a forum where buyers and sellers can post bids and offers, but the parties trade themselves on self hosted wallets, which is also in accordance with FinCEN staff guidance <a target='_blank' href='https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf'>"FIN-2019-G001".</a></p>,
    },
    {
      q: 'Does Faa.st Monitor Transactions?',
      a: <p>While Faa.st itself does not qualify as a virtual asset service provider (VASP), we take fraud very seriously. Faa.st actively collaborates with law enforcement when an appropriate request has been submitted. Furthermore, Faa.st has a <a href='https://faa.st/law-enforcement' target='_blank'>simple website law enforcement can use</a> to quickly search addresses to follow swaps across blockchains. Faa.st discourages the use of its platform as an anonymising service, and takes active precautions to prevent such use, in accordance to our <a href='https://faa.st/terms' target='_blank'>terms of use.</a></p>,
    },
    {
      q: 'As a trader, how can I be sure that the maker fulfills the order?',
      a: 'All makers maintain an amount of Bitcoin in a capacity payment channel. When a swap is in progress, the submit a hash locked transaction to ensure that if the swap is not fulfilled, the channel can be re-directed to another maker to fulfill the swap.',
    },
    {
      q: 'What is a capacity payment channel?',
      a: <p>Capacity payment channels are bitcoin payment channels similar to Lightning Channels. The involve multi-signature addresses and partially signed transactions, among other things. You can learn more about <a href='https://en.bitcoin.it/wiki/Payment_channels' target='_blank'>payment channels here.</a></p>,
    },
    {
      q: 'Can a DeFi hack drain everyones wallets?',
      a: "No. The Faa.st network operates very differently from DeFi platforms such as UniSwap. Hacking Faa.st doesn't gain access to any wallets. There is not currently a single smart contract where all participants deposit their cryptocurrency, and can be the target of attack. When running a Faa.st maker node, your cryptocurrency remain in your custody with your private keys. Possible risk  lies in the security of device running your maker node. You should take precautions to prevent unauthorized access to your server, and ensure that you backup your wallet seed offline, and never store it in plaintext on the internet.",
    },
    {
      q: 'What do I need to run a market maker node?',
      a: 'You will need 3 things to run a market maker node: Cryptocurrency, a computer/server, and an account on a cryptocurrency exchange.',
    },
    {
      q: 'Can I run makers as a business?',
      a: 'No, this is explicitly against our terms of use to operate maker nodes as a business. The intended audience of market makers are hobbyists and cryptocurrency enthusiasts.',
    },
    {
      q: 'How much will I earn?',
      a: 'The market maker program is not designed for predictable rewards. Maker rewards are based on the number of swaps completed, the size of swaps, and more. Overall, which cryptocurrency is specialized and the demand of that currency will be the largest factor in terms of how much volume is swapped.',
    },
    {
      q: 'Is it possible to not earn rewards on a Swap?',
      a: 'As with all trading, when market making there is always a risk of prices moving sharply in short periods of time. When this happens, some swaps may earn no rewards, or even lose a small amount when settlement is complete. These instances tend to be rare, and you are free to contribute to the maker node if you can think of ways to minimize this risk.',
    },
    {
      q: 'Do I need any extra hardware to run a market maker node?',
      a: 'No, but it is recommended that you run your node on a server. This will allow you to complete trades 24 hours/day and make the most interest off your Bitcoin.',
    },
    {
      q: 'What is the maximum amount of trade value I will be able to fulfill at any one time?',
      a: 'All makers open a capacity payment channel with the Faa.st network. The size of this capacity channel limits the size of any single swap at a time.',
    },
    {
      q: 'How are wallet/exchange/api keys proven safe?',
      a: 'The market maker node will be completely open source and auditable by the community. All private keys and API keys are stored locally on the market maker node, and are not transmitted remotely.',
    },
    {
      q: 'Do I need to keep my crypto on an exchange in order to complete trades?',
      a: 'Generally, all crypto is withdrawn from your exchange account after a swap is complete.',
    },
    {
      q: 'What are atomic swaps?',
      a: <div>
        <p>Atomic swaps are blockchain transactions wherein a trade can occur in which the trade also acts as the settlement. This means that the deposit and withdrawal of a trade happen at the same time, and can't be reversed! This removes all counter-party risk from cryptocurrency trading, which is a very big deal. The technology to enable this has existed for some time now, but there is a larger problem: <b>counter-party discovery.</b> Due to how blockchains function, discovery, pricing and all the rest can't really happen cross chain. We need a new type of network for that.</p>
        <p>In short, how do traders find makers? Our goal is to provide the simplest and fastest method to achieve this. The initial launch of the Faa.st maker program is a small step towards this goal. As we continue to roll our new atomic swaps, <b>we aim to be the de-facto network for swap discovery.</b></p>
      </div>,
      id: 'atomicswaps'
    }
  ]
  return (
    <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
      <div style={{ background: `url(${MakerBg})`, backgroundSize: 'cover', width: '100%', minHeight: 650 }}>
        <div className={classNames(coinContainer, 'd-none d-lg-block')}>
          <div className={classNames(eth, line)}>
            <img src={EthereumLogo} style={{ width: 91, height: 93 }} />
          </div>
          <div className={classNames(ltc, line)}>
            <img src={LitecoinLogo} style={{ width: 81, height: 82 }} />
          </div>
          <div className={classNames(btc, line)}>
            <img src={BitcoinLogo} style={{ width: 71, height: 72 }} />
          </div>
        </div>
        <Header 
          theme='dark' 
          style={{ zIndex: 9 }} 
          className='position-relative' 
          headerColor={'transparent'} 
          translations={translations}
        />
        <div style={{ minHeight: '85vh' }} className={classNames('mb-0 py-5 position-relative')}>
        <Container>
        <Row>
          <Col sm='12' lg='6' className={classNames('text-left pl-md-5 pl-0 ml-4', 'mt-xs-5 mt-lg-5 pt-5')}>
            <h1 className={classNames('hero-title mb-4', heroTitle)} style={{ fontWeight: 'normal', fontSize: 48, fontWeight: 600 }}>
              Liquidity mining now available on Faa.st
            </h1>
            <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal', color: '#B3BCD8' }}>
              Run a Faa.st  powered market maker node, contribute to decentralizing the financial world, and earn liquidity rewards
            </p>
            <p>
              <Button 
                tag='a' 
                className={classNames('btn btn-primary btn-lg hero-button py-2 mr-3 mb-sm-0 mb-3', shadow)}
                color='primary'
                role='button' 
                href='https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse'
                target='_blank noreferrer'
              >
                Sign up for Beta
              </Button>
              <Button 
                tag='a' 
                className={classNames('btn btn-primary btn-lg hero-button py-2 mb-sm-0 mb-3', shadow)}
                color='white'
                role='button' 
                href='https://api.faa.st'
                target='_blank noreferrer'
              >
                Read the Docs
              </Button>
            </p>
          </Col>
        </Row>
      </Container>
        </div>
      </div>
      <Row style={{ marginTop: 0, backgroundColor: '#1A212A' }} className={classNames(sectionContainer, 'px-0 mx-0')}>
        <Col className='p-0 pl-md-3 pl-0 text-xs-center text-left' xs={{ order: 1, size: 12 }}  lg={{ order: 0, size: 6 }}>
           <h2 className='d-none d-lg-block' style={{ fontWeight: 600, marginBottom: 10 }}>Popular Coins for Faa.st Makers</h2>
           <Row className='justify-content-center mx-auto mt-4' style={{ maxWidth: 600 }}>
              {popularCoins.map((coin, i) => {
                return (
                  <Col 
                    xs='6' 
                    key={coin} 
                    className={classNames(shadow, 'py-3 mb-2 text-center', i % 2 == 0 && 'mr-2 ml-lg-0 ml-2')} 
                    style={{ backgroundColor: '#fff', borderRadius: 4, maxWidth: 250, cursor: 'default' }}
                  >
                    <CoinIcon style={{ marginRight: 10 }} symbol={coin} /> 
                    <span style={{ fontSize: 22, color: '#1A212A', fontWeight: 600, verticalAlign: 'middle' }}>{coin}</span>
                  </Col>
                )
              })}
           </Row>
        </Col>
        <Col 
          xs={{ order: 0, size: 12 }} 
          lg={{ order: 1, size: 6 }} 
          className={classNames(textContainer, 'p-0 px-md-5 px-4 mb-lg-0 mb-3 align-self-center')}
        >
            <h5 className={classNames(sectionIntro, 'mb-3')}>
              Liquidity Mining
            </h5>
            <h2 className={sectionTitle}>
            Earn Rewards by Providing Liquidity
            </h2>
            <h5 className={sectionDescription}>Balances held while liquidity mining earn rewards based on volume and activity.</h5>
            <a className={classNames(sectionLink, link, 'mb-3 d-inline-block')} href='#liquiditymining'>
              More on Liquidity Mining <i className='fa fa-arrow-right' />
            </a>
        </Col>
      </Row>
      <Row style={{ marginTop: 0, backgroundColor: '#1A212A', paddingBottom: 450 }} className={classNames(sectionContainer, stackGradient, 'px-0 mx-0 align-items-center')}>
        <Col 
          xs={{ order: 0, size: 12 }} 
          lg={{ order: 0, size: 6 }} 
          className={classNames(textContainer, 'p-0 pl-md-5 pl-4 mb-lg-0 mb-3 mx-auto')}s
          style={{ maxWidth: 600 }}
        >
            <h5 className={classNames(sectionIntro, 'mb-3')}>
              Passive Stacking
            </h5>
            <h2 className={sectionTitle}>
              Specialize in a crypto you’re excited about
            </h2>
            <h5 className={sectionDescription}>
            Specialize in a coin you’re holding for the long run. Allow others to trade for coins they’re excited about and earn rewards in a coin you’re excited about.
            </h5>
            <a className={classNames(sectionLink, link, 'mb-3 d-inline-block')} href='https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse' target='_blank noreferrer'>
              Start Stacking Now <i className='fa fa-arrow-right' />
            </a>
        </Col>
        <Col className='p-0 pl-md-3 pl-0 text-xs-center text-left' xs={{ order: 1, size: 12 }}  lg={{ order: 1, size: 6 }}>
          <StackedCoins style={{ width: '100%', maxWidth: 500 }} />
        </Col>
      </Row>
      <Row style={{ marginTop: 0, background: '#F9FAFB' }} className={classNames(sectionContainer, 'px-0 mx-0 position-relative')}>
        <Col style={{ paddingBottom: 0 }} xs='12'>
          <div className={classNames('mx-auto px-4 py-5 text-center', shadowLight)} style={{ maxWidth: '90%', backgroundColor: '#fff', borderRadius: 4, position: 'relative', marginTop: -360 }}>
            <h1 className={classNames('font-weight-bold mb-3', sectionTitle)} style={{ color: blueColor }}>Getting Started is Fast and Easy</h1>
            <h3 className={sectionDescription} style={{ color: '#43546B' }}>Run a simple and open source app that automates everything for you.</h3>
            <MakerSetup style={{ maxWidth: '100%' }} className='my-5 d-lg-inline-block d-none' />
            <MakerSetupMobile style={{ maxWidth: '100%' }} className='d-lg-none d-inline-block my-md-5 my-0' />
            <div>
              <Button 
                tag='a' 
                className={classNames('btn btn-primary btn-lg hero-button py-2 flat')}
                color='primary'
                role='button' 
                href='https://docs.google.com/forms/d/e/1FAIpQLSfxnI0SPvQu-4oVi2YCa7Lp_UEK8WyDFNFSMoXVxZD7Ioxjzw/formResponse'
                target='_blank noreferrer'
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row style={{ background: '#F9FAFB'}} className='text-center pb-5 pt-5 mx-0'>
        <Col>
        <Container>
          <h5 style={{ color: '#5F6D7E' }} className={classNames(sectionIntro, 'mb-4')}>
            How does Faa.st work?
          </h5>
          <h1 className={classNames('font-weight-bold mb-3', sectionTitle)} style={{ color: blueColor }}>Peer to Peer Swaps with Market Makers</h1>
          <h3 className={sectionDescription} style={{ color: '#43546B' }}>As opposed to most exchanges and swap services, Faa.st is fully peer to peer. This means that Faa.st itself is not a counterparty to any swaps. Faa.st operates a service to list market makers, and match them with traders.</h3>
          <HowFaastWorks style={{ maxWidth: '100%' }} className='mt-5 pt-4 d-lg-block d-none' />
          <div className='text-center mt-5'>
            <HowFaastWorksMobile className='d-lg-none d-inline-block' />
          </div>
        </Container>
        </Col>
      </Row>
      <Row style={{ background: '#F9FAFB'}} className='text-center pb-5 pt-5 mx-0'>
        <Col style={{ paddingTop: 80 }}>
        <Container className='px-0'>
          <h5 style={{ color: '#5F6D7E' }} className={classNames(sectionIntro, 'mb-4')}>
            Contribute
          </h5>
          <h1 className={classNames('font-weight-bold mb-3', sectionTitle)} style={{ color: blueColor }}>Buidl what’s missing</h1>
          <h3 className={classNames(sectionDescription, 'py-3')} style={{ color: '#43546B' }}>
            Is the crypto or token you're looking to support not available? Is the exchange you trade on not currently supported?  The Faa.st maker node is open source, you're welcome to make contributions on our github repository. If you're not a developer, you can still help! Just keep us posted on any issues you might notice.
          </h3>
          <Terminal translations={translations} includeCopy={false} theme='light' />
        </Container>
        </Col>
      </Row>
      <Row style={{ background: '#F9FAFB' }} className='text-center pb-5 mx-0'>
        <Col style={{ paddingBottom: 100  }}>
        <Container>
          <h5 style={{ color: '#5F6D7E' }} className={classNames(sectionIntro, 'mb-4')}>
            What's next?
          </h5>
          <h1 className={classNames('font-weight-bold mb-3', sectionTitle)} style={{ color: blueColor }}>Atomic Swaps on the Horizon</h1>
          <h3 className={classNames(sectionDescription, 'mt-4')} style={{ color: '#43546B' }}>
            Atomic swaps are blockchain transactions wherein a trade can occur in which the trade also acts as the settlement. This means that the deposit and withdrawal of a trade happen at the same time, and can't be reversed! This removes all counter-party risk from cryptocurrency trading, which is a very big deal. Our goal is to provide the simplest and fastest method to achieve this. The initial launch of the Faa.st maker program is a small step towards this goal. As we continue to roll our new atomic swaps, we aim to be the de-facto network for swap discovery.
          </h3>
          <Button 
            tag='a' 
            className={classNames('btn btn-primary btn-lg hero-button py-2 mr-3 flat mt-4')}
            color='primary'
            role='button' 
            href='#atomicswaps'
          >
            More about Atomic Swaps
          </Button>
        </Container>
        </Col>
      </Row>
      <Row style={{ background: '#F9FAFB' }} className='text-center pb-5 mx-0'>
        <Col>
          <h1 className={classNames('font-weight-bold mb-3', sectionTitle)} style={{ color: blueColor }}>Frequently Asked Questions</h1>
          <Container>
            {faqCopy.map((x, i) => {
              return (
                <Row key={i} id={x.id || ''} className={classNames('text-left mb-3', i == 0 && 'mt-5')}>
                  <Col>
                    <Collapse isOpen={true}>
                      <Card className='flat border-0'>
                        <CardBody className={faq}>
                          <h5 className='font-weight-bold' style={{ color: blueColor }}>{x.q}</h5>
                          {x.a}
                        </CardBody>
                      </Card>
                    </Collapse>
                  </Col>
                </Row>
              )
            })}
          </Container>
        </Col>
      </Row>
      <Footer translations={translations} theme='light' />
    </div>
  )})
