import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import LazyLoad from 'react-lazyload'

import IconCarousel from 'Site/components/IconCarousel'

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

import MacbookScreenshot2 from 'Img/macbook-screenshot-02.png'

import BitaccessLogo from 'Img/bitaccess.svg'

export default compose(
  setDisplayName('Features'),
)(({ supportedAssets = [], translations: { static: { features: t = {} } = {} } }) => (
  <Fragment>
    <div className='features-clean'>
      <div className='container' style={{ paddingTop: '100px' }}>
        <h2 className='text-center' style={{ marginBottom: '75px', fontWeight: 'normal' }}>
          {t.instantlyBuild}
        </h2>
        <div className='row features'>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>{t.safeSecure}<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>
              {t.tradeDirectly} <br/>
            </p>
          </div>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>{t.noSignUp}<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>
              {t.noRegister} <br/>
            </p>
          </div>
          <div className='col-sm-12 col-md-4 col-lg-4 item'>
            <i className='far fa-check-circle icon' style={{ color: '#01B69B' }}></i>
            <h3 className='name' style={{ fontWeight: 'normal' }}>{t.lightningFast}<br/></h3>
            <p className='description' style={{ fontSize: '16px' }}>{t.instantAccess}<br/></p>
          </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-md-12 col-lg-8' style={{ paddingTop: '20px' }}>
            <h5 className='text-center text-body'>
              <strong>
                {t.noDepositFees}
              </strong>
            </h5>
          </div>
          <div className='w-100'></div>
          <div className='col-12 col-md-12 col-lg-8 col-xl-8'>
            <h3 className='text-center text-dark' style={{ marginTop: '3rem' }}>{t.leaveMore}</h3>
            <p className='text-center' style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
              {t.amountReceivedFromPairs}
            </p>
            <div className='p-1' style={{ height: 'auto', backgroundColor: '#00d7b8', marginBottom: '20px', width: '90%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Faast - MTL/WINGS</h6>
              <p className='text-dark mb-0' style={{ marginLeft: '8px' }}><strong>$98.74</strong><br/></p>
            </div>
            <div className='p-1' style={{ height: 'auto', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '60%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Kyber Network - MTL/WINGS<br/></h6>
              <p className='text-dark mb-0' style={{ marginLeft: '8px' }}><strong>$95.80</strong><br/></p>
            </div>
            <div className='p-1' style={{ height: 'auto', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '45%' }}>
              <h6 className='text-dark mb-2' style={{ marginLeft: '8px', paddingTop: '8px' }}>Binance & Bittrex - ANT/BCPT <br/></h6>
              <p className='text-dark mb-0' style={{ marginLeft: '8px' }}><strong>$88.83</strong><br/></p>
            </div>
            <p className='text-center' style={{ marginTop: '2rem', marginBottom: '3rem' }}>
              <small>
                {t.method} {t.click} <a className='text-dark' href='https://medium.com/faast/faast-vs-kyber-swap-vs-bittrex-binance-which-saves-you-the-most-on-token-swaps-1ee9c4b16c79' target='_blank noopener'>
                  {t.here}
                </a> {t.learnMore}
              </small>
            </p>
            <p className='lead text-center py-3 px-3 mb-4' style={{ backgroundColor: '#F3F5F8' }}>
              <a className='text-dark' href='https://medium.com/faast/faast-vs-kyber-swap-vs-bittrex-binance-which-saves-you-the-most-on-token-swaps-1ee9c4b16c79' target='_blank noopener'>
                {t.readMedium}
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
            <h4 className='text-light mb-0'>{t.coinsSupported}</h4>
          </div>
          <div className='col-12 text-center py-3 d-md-none'>
            <h1 className='currency-count text-white font-weight-bold'>{supportedAssets.length} <small>{t.coinsSupported}</small></h1>
          </div>
          <div className='col px-2'>
            <IconCarousel items={supportedAssets.map(({ symbol, name, iconUrl, marketCap }) => ({
              key: symbol,
              label: (<p>{name}</p>),
              iconUrl,
              marketCap,
              link: `/app/swap?to=${symbol}`,
            }))}/>
          </div>
        </div>
        <p>For a comprensive table of supported coins <a href='/assets'>click here!</a></p>
      </div>
    </div>
    <div className='highlight-phone slick-interface-section'>
      <div className='container'>
        <div className='row align-items-center'>
          <div className='col-md-6 col-lg-5 col-xl-5 offset-md-0 offset-lg-0 offset-xl-1 align-self-center' style={{ marginBottom: '0px' }}>
            <div className='intro'>
              <h2 className='text-white' style={{ fontWeight: 'normal', marginBottom: '20px' }}>{t.slick}</h2>
              <p className='text-white' style={{ marginBottom: '30px' }}>{t.intuitive} <strong>{t.clickAndDrag}</strong>{t.visuallyAllocate}
                <br/>
              </p>
              <a className='btn btn-light active' role='button' href='/app'>{t.startTrading}</a></div>
          </div>
          <div className='col-sm-12 col-md-6 col-lg-7 col-xl-6 offset-md-0 offset-lg-0 offset-xl-0 align-self-center' style={{ paddingTop: '30px' }}>
            <LazyLoad offset={500} height={300}>
              <img className='img-fluid' src={MacbookScreenshot2} style={{ marginTop: '0px' }}/>
            </LazyLoad>
          </div>
        </div>
      </div>
    </div>
    <div className='text-white mt-5'>
      <p className='lead text-center text-muted' style={{ marginTop: '0px', marginBottom: '20px' }}>{t.supportedWallets}<br/></p>
      <div className='row no-gutters justify-content-center'>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/trezor'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={TrezorWalletLogo} alt='trezor'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.trezor}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/ledger-wallet'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={LedgerWalletLogo} alt='ledger logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.ledgerWallet}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/metamask'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={MetaMaskLogo} alt='metamask logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.metaMask}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/mist-browser'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={MistLogo} alt='mist logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.mist}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/trust-wallet'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={TrustWalletLogo} alt='trust wallet logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.trustWallet}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/coinbase-wallet'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={CoinbaseWalletLogo} alt='coinbase wallet logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.coinbaseWallet}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/wallets/status'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={StatusWalletLogo} alt='status logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.status}</p>
          </a>
        </div>
        <div className='col-auto'>
          <a className='d-block text-white' href='/app/connect'>
            <LazyLoad offset={500} height={72}>
              <img className='rounded wallet-logo' src={MewLogo} alt='my ether wallet logo'/>
            </LazyLoad>
            <p className='text-center pt-2'>{t.keystore}</p>
          </a>
        </div>
      </div>
    </div>
    <div className='team-clean mt-5'>
      <div className='container'>
        <div className='intro'></div>
        <div className='row people'>
          <div className='col-sm-4 col-md-4 col-lg-4 item pt-2r'>
            <LazyLoad offset={500} height={161}>
              <img src={SecureIcon} style={{ height: '161px', width: '316px', backgroundColor: 'rgba(243,245,248,0)', padding: '25px' }}/>
            </LazyLoad>
            <h5 className='name' style={{ fontWeight: 'normal' }}>{t.secure}</h5>
            <p className='description'>{t.safestTradingMethod}<br/></p>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-4 offset-md-3 offset-lg-0 item ml-0 pt-2r'>
            <LazyLoad offset={500} height={161}>
              <img src={SimpleIcon} style={{ width: '306px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)', height: '161px' }}/>
            </LazyLoad>
            <h5 className='name' style={{ fontWeight: 'normal' }}>{t.simple}</h5>
            <p className='title'></p>
            <p className='description'>{t.intuitiveMobile}<br/></p>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-4 item pt-2r'>
            <LazyLoad offset={500} height={161}>
              <img className='rounded-circle' src={PrivacyIcon} style={{ width: '234px', height: '161px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)' }}/>
            </LazyLoad>
            <h5 className='name' style={{ fontWeight: 'normal' }}>{t.private}</h5>
            <p className='description'>{t.noPersonalData}<br/></p>
          </div>
          <div className='col'>
            <hr style={{ height: '-1px', backgroundColor: 'rgba(0,0,0,0.15)', marginTop: '30px' }}/>
            <h2 className='text-center name' style={{ marginTop: '30px', fontWeight: 'normal' }}>{t.getStartedSeconds}</h2>
          </div>
        </div>
      </div>
    </div>
    <div className='features-boxed' style={{ backgroundColor: '#ffffff' }}>
      <div className='container'>
        <div className='intro'></div>
        <div className='row justify-content-center features' style={{ paddingTop: '0px', marginTop: '-60px' }}>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'>
              <LazyLoad offset={500} height={55}>
                <img src={AddWalletIcon} style={{ marginBottom: '23px' }}/>
              </LazyLoad>
              <h3 className='name' style={{ fontWeight: 'normal' }}>{t.addWallet}</h3>
            </div>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'>
              <LazyLoad offset={500} height={55}>
                <img src={ViewDashboardIcon} style={{ marginBottom: '30px' }}/>
              </LazyLoad>
              <h3 className='name' style={{ fontWeight: 'normal' }}>{t.viewDashboard}</h3>
            </div>
          </div>
          <div className='col-sm-4 col-md-4 col-lg-3 item'>
            <div className='box'>
              <LazyLoad offset={500} height={55}>
                <img src={SwapFundsIcon} style={{ marginBottom: '20px' }}/>
              </LazyLoad>
              <h3 className='name' style={{ fontWeight: 'normal' }}>{t.swapFunds}</h3>
            </div>
          </div>
          <div className='col-md-4 col-lg-4 col-xl-4 offset-md-0 offset-lg-0 offset-xl-0' style={{ paddingTop: '10px' }}><a className='btn btn-dark btn-block btn-lg hero-button' role='button' href='/app'>{t.getStarted}</a></div>
        </div>
      </div>
    </div>
    <div className='newsletter-subscribe' style={{ backgroundColor: '#181818' }}>
      <div className='container'>
        <div className='text-center w-100 mb-4'>
          <p className='text-white'>{t.productHunt}</p>
          <LazyLoad offset={500} height={55}>
            <iframe src='https://yvoschaap.com/producthunt/counter.html#href=https%3A%2F%2Fwww.producthunt.com%2Fr%2Fp%2F114880&layout=tall'
              width='56px' height='65px' scrolling='no' frameBorder={0}></iframe>
          </LazyLoad>
        </div>
      </div>
    </div>
    <div className='brands'>
      <a className='text-white-50' href='https://bitaccess.ca/' target='_blank noopener' style={{ backgroundColor: '#364B5E', height: '185px', textDecoration: 'none' }}>
        <p className='text-center text-white'>{t.madeBy}<br/></p>
        <LazyLoad offset={500} height={69}>
          <img src={BitaccessLogo} style={{ marginTop: '0px' }}/>
        </LazyLoad>
      </a>
    </div>
  </Fragment>
))