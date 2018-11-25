import * as React from 'react'
import { withRouteData, Link } from 'react-static'
import { compose, setDisplayName, withProps } from 'recompose'
import siteConfig from 'Site/config'
import { Asset } from 'Types'

// import logoImg from 'Img/faast-logo.png'
import EmailSubscriptionForm from 'Site/components/EmailSubscriptionForm'
import IconCarousel from 'Site/components/IconCarousel'
import SwapWidget from 'Site/components/SwapWidget'

import TrezorWalletLogo from 'Img/wallet/trezor.png'
import LedgerWalletLogo from 'Img/wallet/ledger.png'
import MistLogo from 'Img/wallet/mist.png'
import MetaMaskLogo from 'Img/wallet/metamask.png'
import StatusWalletLogo from 'Img/wallet/status.png'
import CoinbaseWalletLogo from 'Img/wallet/coinbase.png'
import TrustWalletLogo from 'Img/wallet/trust.png'
import MewLogo from 'Img/wallet/mew.svg'

import SecureIcon from 'Img/secure.svg'
import SimpleIcon from 'Img/simple.svg'
import PrivacyIcon from 'Img/privacy.svg'

import AddWalletIcon from 'Img/add-wallet.svg'
import ViewDashboardIcon from 'Img/view-dashboard.svg'
import SwapFundsIcon from 'Img/swap-funds.svg'

import MoonBackground from 'Img/moon-background.jpg'
import MacbookScreenshot1 from 'Img/macbook-screenshot-01.png'
import MacbookScreenshot2 from 'Img/macbook-screenshot-02.png'

import BitaccessLogo from 'Img/bitaccess.svg'
import FaastLogo64x64 from 'Img/faast-logo-64x64.png'

type PrunedAsset = Pick<Asset, 'symbol' | 'name' | 'iconUrl'>

interface Props {
  supportedAssets: PrunedAsset[]
}
/* tslint:disable:max-line-length */
export default compose<Props, {}>(
  setDisplayName('Home'),
  withRouteData,
)(({ supportedAssets }: Props) => (
  <div>
    <div>
      <nav className='navbar navbar-dark navbar-expand-md navigation-clean-button'
        style={{ backgroundColor: 'transparent', paddingLeft: '12px' }}>
        <div className='container'>
          <Link exact to='/' className='navbar-brand text-white' style={{ fontWeight: 400 }}>
            <img src={FaastLogo64x64} style={{ height: '32px', marginRight: '16px' }}/>{siteConfig.name}
          </Link>
          <button className='navbar-toggler' data-toggle='collapse' data-target='#navcol-1'>
            <span className='sr-only'>Toggle navigation</span>
            <span className='navbar-toggler-icon text-white'></span>
          </button>
          <div className='collapse navbar-collapse' id='navcol-1'>
            <ul className='nav navbar-nav ml-auto'>
              <li className='nav-item' role='presentation'>
                <a className='nav-link text-light' href='/app/swap'>Swap</a>
              </li>
              <li className='nav-item' role='presentation'>
                <a className='nav-link text-light' href='https://medium.com/faast' target='_blank' rel='noopener'>Blog</a>
              </li>
              <li className='nav-item' role='presentation'>
                <a className='nav-link py-1' href='/app'><button className='btn btn-light'>Portfolio</button></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className='jumbotron jumbotron-fluid hero-technology mb-0' style={{
          backgroundImage: `url(${MoonBackground})`,
          height: '759px',
          backgroundPosition: '50% 25px',
          backgroundSize: '1400px',
          backgroundRepeat: 'no-repeat',
          marginTop: '-160px',
          paddingTop: '220px',
          backgroundColor: 'rgba(0,26,23)',
        }}>
        <h1 className='hero-title' style={{ fontWeight: 'normal' }}>Trade Crypto</h1>
        <p className='hero-subtitle' style={{ fontWeight: 'normal', width: '90%' }}>
          It’s never been this easy to build a diversified cryptocurrency portfolio<br/>
        </p>
        <p><a className='btn btn-light btn-lg hero-button py-2' role='button' href='/app'>
          Create A Portfolio
        </a></p>
        <div className='intro' style={{ paddingTop: '60px' }}>
          <img className='img-fluid' src={MacbookScreenshot1} style={{ height: '100%', width: '730px' }}/>
        </div>
      </div>
    </div>
    <div className='features-clean'>
      <div className='container' style={{ paddingTop: '100px' }}>
        <h2 className='text-center' style={{ marginBottom: '75px', fontWeight: 'normal' }}>
          Instantly build a cryptocurrency portfolio
        </h2>
        <div className='row features'>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>Safe &amp; Secure<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>
              Trade directly from your wallet— we never control your funds or see your private key.<br/>
            </p>
          </div>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>No Sign Up Required<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>
              No need to register or share any personal info.<br/>
            </p>
          </div>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>Lightning Fast<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>With instant access to over 100+ coins!<br/></p>
          </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-md-12 col-lg-8' style={{ paddingTop: '20px' }}>
            <h5 className='text-center text-body'>
              <strong>
                No deposit fees. No subscription fees. No exit fees. Faast is a simple, low cost on-chain trading engine.
              </strong>
            </h5>
          </div>
          <div className='w-100'></div>
          <div className='col-12 col-md-12 col-lg-8 col-xl-8'>
            <h3 className='text-center text-dark' style={{ marginTop: '3rem' }}>Leave more in your wallet</h3>
            <p className='text-center' style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
              Amount received from trading $100 of Aragon for Aeternity
            </p>
            <div style={{ height: '64px', backgroundColor: '#00d7b8', marginBottom: '20px', width: '90%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Faast</h6>
              <p className='text-dark' style={{ marginLeft: '8px' }}><strong>$95.80</strong><br/></p>
            </div>
            <div style={{ height: '64px', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '40%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Kyber Network<br/></h6>
              <p className='text-dark' style={{ marginLeft: '8px' }}><strong>$90.79</strong><br/></p>
            </div>
            <div style={{ height: '64px', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '30%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Binance & Bittrex<br/></h6>
              <p className='text-dark' style={{ marginLeft: '8px' }}><strong>$89.91</strong><br/></p>
            </div>
            <p className='text-center' style={{ marginTop: '2rem', marginBottom: '3rem' }}>
              <small>
                Method: this graph shows the estimated amount received from trading $100 worth of Aragon (ANT) for Aeternity (AE) using Faast versus other popular cryptocurrency providers.
                Click <a className='text-dark' href='https://medium.com/faast/binance-vs-kyber-vs-faast-which-exchange-will-save-you-the-most-money-e19972dd11df' target='_blank'>
                  here
                </a> to learn more.
              </small>
            </p>
            <p className='lead text-center py-3 px-3 mb-4' style={{ backgroundColor: '#F3F5F8' }}>
              <a className='text-dark' href='https://medium.com/faast/binance-vs-kyber-vs-faast-which-exchange-will-save-you-the-most-money-e19972dd11df' target='_blank'>
                Read our Medium post on end-to-end price comparisons
              </a>
            </p>
          </div>
        </div>
        <div className='row'></div>
      </div>
    </div>
    <div className='py-4' style={{ backgroundColor: '#015247' }}>
      <div className='container'>
        <div className='row align-items-center'>
          <div className='col-auto text-center px-5 py-4 d-none d-md-block' style={{ borderRight: 'solid 2px #0D342E' }}>
            <h1 className='currency-count text-white font-weight-bold'>{supportedAssets.length}</h1>
            <h4 className='text-light mb-0'>Coins Supported</h4>
          </div>
          <div className='col-12 text-center py-3 d-md-none'>
            <h1 className='currency-count text-white font-weight-bold'>{supportedAssets.length} <small>Coins Supported</small></h1>
          </div>
          <div className='col px-2'>
            <IconCarousel items={supportedAssets.map(({ symbol, name, iconUrl }) => ({
              key: symbol,
              label: (<p>{name}</p>),
              iconUrl,
              link: `/app/assets/${symbol}`,
            }))}/>
          </div>
        </div>
      </div>
    </div>
    <div className='highlight-phone slick-interface-section'>
      <div className='container'>
        <div className='row align-items-center'>
          <div className='col-md-6 col-lg-5 col-xl-5 offset-md-0 offset-lg-0 offset-xl-1 align-self-center' style={{ marginBottom: '0px' }}>
            <div className='intro'>
              <h2 className='text-white' style={{ fontWeight: 'normal', marginBottom: '20px' }}>Slick &amp; Simple Interface</h2>
              <p className='text-white' style={{ marginBottom: '30px' }}>With our unique and intuitive <strong>‘click-and-drag’ slider&nbsp;interface</strong>, you can visually allocate how much of any coin you want to toward a trade— swap multiple coins at once, and build a diversified portfolio in
                seconds with only a single transaction.<br/></p><a className='btn btn-light active' role='button' href='/app'>Start Trading</a></div>
          </div>
          <div className='col-sm-12 col-md-6 col-lg-7 col-xl-6 offset-md-0 offset-lg-0 offset-xl-0 align-self-center' style={{ paddingTop: '30px' }}>
            <img className='img-fluid' src={MacbookScreenshot2} style={{ marginTop: '0px' }}/>
          </div>
        </div>
      </div>
    </div>
    <div className='text-white mt-5'>
      <p className='lead text-center text-muted' style={{ marginTop: '0px', marginBottom: '20px' }}>Supported Wallets<br/></p>
      <div className='row no-gutters justify-content-center'>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect/hw/trezor'>
            <img className='rounded wallet-logo' src={TrezorWalletLogo} alt='trezor'/>
            <p className='text-center pt-2'>TREZOR</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect/hw/ledger'>
            <img className='rounded wallet-logo' src={LedgerWalletLogo} alt='ledger logo'/>
            <p className='text-center pt-2'>Ledger Wallet</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={MetaMaskLogo} alt='metamask logo'/>
            <p className='text-center pt-2'>MetaMask</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={MistLogo} alt='mist logo'/>
            <p className='text-center pt-2'>Mist</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={TrustWalletLogo} alt='trust wallet logo'/>
            <p className='text-center pt-2'>Trust Wallet</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={CoinbaseWalletLogo} alt='coinbase wallet logo'/>
            <p className='text-center pt-2'>Coinbase Wallet</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={StatusWalletLogo} alt='status logo'/>
            <p className='text-center pt-2'>Status</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <img className='rounded wallet-logo' src={MewLogo} alt='my ether wallet logo'/>
            <p className='text-center pt-2'>Keystore</p>
          </a>
        </div>
      </div>
    </div>
    <div className='team-clean mt-5'>
      <div className='container'>
        <div className='intro'></div>
        <div className='row people'>
          <div className='col-sm-4 col-md-4 col-lg-4 item pt-2r'>
            <img src={SecureIcon} style={{ height: '161px', width: '316px', backgroundColor: 'rgba(243,245,248,0)', padding: '25px' }}/>
            <h5 className='name' style={{ fontWeight: 'normal' }}>Secure</h5>
            <p className='description'>The safest trading method in the world— we don’t have your money; if we got hacked, you’d lose nothing.<br/></p>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-4 offset-md-3 offset-lg-0 item ml-0 pt-2r'>
            <img src={SimpleIcon} style={{ width: '306px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)', height: '161px' }}/>
            <h5 className='name' style={{ fontWeight: 'normal' }}>Simple</h5>
            <p className='title'></p>
            <p className='description'>Intuitive and mobile friendly UI makes crypto trading simple and easy.<br/></p>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-4 item pt-2r'>
            <img className='rounded-circle' src={PrivacyIcon} style={{ width: '234px', height: '161px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)' }}/>
            <h5 className='name' style={{ fontWeight: 'normal' }}>Private</h5>
            <p className='description'>You don’t need to share personal data, photo ID, or anything else— just safe and confidential trades.<br/></p>
          </div>
          <div className='col'>
            <hr style={{ height: '-1px', backgroundColor: 'rgba(0,0,0,0.15)', marginTop: '30px' }}/>
            <h2 className='text-center name' style={{ marginTop: '30px', fontWeight: 'normal' }}>Get started in minutes</h2>
          </div>
        </div>
      </div>
    </div>
    <div className='features-boxed' style={{ backgroundColor: '#ffffff' }}>
      <div className='container'>
        <div className='intro'></div>
        <div className='row justify-content-center features' style={{ paddingTop: '0px', marginTop: '-60px' }}>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'><img src={AddWalletIcon} style={{ marginBottom: '23px' }}/>
              <h3 className='name' style={{ fontWeight: 'normal' }}>Add Wallet</h3>
            </div>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'><img src={ViewDashboardIcon} style={{ marginBottom: '30px' }}/>
              <h3 className='name' style={{ fontWeight: 'normal' }}>View Dashboard</h3>
            </div>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'><img src={SwapFundsIcon} style={{ marginBottom: '20px' }}/>
              <h3 className='name' style={{ fontWeight: 'normal' }}>Swap Funds</h3>
            </div>
          </div>
          <div className='col-md-4 col-lg-4 col-xl-4 offset-md-0 offset-lg-0 offset-xl-0' style={{ paddingTop: '10px' }}><a className='btn btn-dark btn-block btn-lg hero-button' role='button' href='/app'>Get Started</a></div>
        </div>
      </div>
    </div>
    <div className='newsletter-subscribe' style={{ backgroundColor: '#181818' }}>
      <div className='container'>
        <div className='text-center w-100 mb-4'>
          <p className='text-white'>Vote for us on Product Hunt</p>
          <iframe src='https://yvoschaap.com/producthunt/counter.html#href=https%3A%2F%2Fwww.producthunt.com%2Fr%2Fp%2F114880&layout=tall'
            width='56px' height='65px' scrolling='no' frameBorder={0}></iframe>
        </div>

        <EmailSubscriptionForm/>
      </div>
    </div>
    <div className='brands'>
      <a className='text-white-50' href='https://bitaccess.ca/' target='_blank' style={{ backgroundColor: '#364B5E', height: '185px', textDecoration: 'none' }}>
        <p className='text-center text-white'>Made by the team at<br/></p><img src={BitaccessLogo} style={{ marginTop: '0px' }}/>
      </a>
    </div>
    <div className='footer-clean' style={{ backgroundColor: 'rgb(24,24,24)', paddingTop: '0px', height: '394px' }}>
      <footer>
        <div className='container' style={{ paddingTop: '40px' }}>
          <div className='row no-gutters'>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item'>
              <h3 style={{ fontWeight: 'normal', color: '#00d7b8' }}>Faast</h3>
              <ul>
                <li><a className='text-white' href='/app' target='_blank'>Portfolio</a></li>
                <li><a className='text-white' href='/app/swap' target='_blank'>Swap</a></li>
                <li><a className='text-white' href='https://medium.com/faast' target='_blank'>Blog</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item'>
              <h3 style={{ fontWeight: 'normal', color: 'rgb(251,181,18)' }}>Bitaccess</h3>
              <ul>
                <li><a className='text-white' href='https://bitaccess.ca/about-us/' target='_blank'>About Us</a></li>
                <li><a className='text-white' href='/terms' target='_blank'>Terms of use</a></li>
                <li><a className='text-white' href='/privacy' target='_blank'>Privacy Policy</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-2 offset-xl-1 item'>
              <h3 className='text-light' style={{ fontWeight: 'normal' }}>Contact</h3>
              <ul>
                <li><a href='mailto:support@faa.st' style={{ color: 'rgb(255,255,255)' }}>support@faa.st</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item'>
              <h3 className='text-light' style={{ fontWeight: 'normal' }}>Links</h3>
              <ul>
                <li><a href='https://api.faa.st/' target='_blank' style={{ color: 'rgb(255,255,255)' }}>API</a></li>
                <li><a href='/static/faast-press-kit.zip' target='_blank' style={{ color: 'rgb(255,255,255)' }}>Press Kit</a></li>
                <li></li>
              </ul>
            </div>
            <div className='col-lg-12 col-xl-12 offset-lg-0 offset-xl-0 item social text-white' style={{ minHeight: '0px', paddingRight: '0px', paddingLeft: '0px' }}>
              <a href='https://github.com/go-faast'><i className='icon ion-social-github'></i></a>
              <a href='https://www.facebook.com/Faast-237787136707810' target='_blank'><i className='icon ion-social-facebook'></i></a>
              <a href='https://twitter.com/gofaast'><i className='icon ion-social-twitter'></i></a>
              <a href='https://slack.faa.st/' target='_blank'><i className='fab fa-slack-hash'></i></a>
              <a href='https://www.reddit.com/r/gofaast/' target='_blank'><i className='icon ion-social-reddit'></i></a>
              <p className='lead text-white copyright'>© {siteConfig.year} {siteConfig.author}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
))
