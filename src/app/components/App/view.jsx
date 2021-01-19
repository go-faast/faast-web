import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import Connect from 'Components/Connect'
import TradeHistory from 'Components/TradeHistory'
import WalletOpened from 'Components/WalletOpened'
import Dashboard from 'Components/Dashboard'
import Modify from 'Components/Modify'
import SearchResults from 'Components/SearchResults'
import ModalRoute from 'Components/ModalRoute'
import TradeDetailModal from 'Components/TradeDetailModal'
import SwapWidget from 'Components/SwapWidget'
import SwapWidgetStepTwo from 'Components/SwapWidget/StepTwo'
import AssetDetail from 'Components/AssetDetail'
import AssetIndex from 'Components/AssetIndex'
import AssetNews from 'Components/AssetNews'
import AffiliateLogin from 'Components/Affiliate/Login'
import AffiliateAcceptTerms from 'Components/Affiliate/AcceptTerms'
import AffiliateSignup from 'Components/Affiliate/Signup'
import AffiliateDashboard from 'Components/Affiliate/Dashboard'
import AffiliateSettings from 'Components/Affiliate/Settings'
import AffiliatePayouts from 'Components/Affiliate/Payouts'
import AffiliateSwaps from 'Components/Affiliate/Swaps'
import AffiliateTerms from 'Components/Affiliate/Terms'
import AffiliateAccountModal from 'Components/Affiliate/AccountModal'
import AssetWatchlist from 'Components/AssetWatchlist'
import AssetTrending from 'Components/AssetTrending'
import Footer from 'Components/Footer'
import MobileWalletModal from 'Components/MobileWalletModal'
import Settings from 'Components/Settings'
import Wallets from 'Components/Wallets'
import WalletDepositModal from 'Components/WalletDepositModal'
import WalletWithdrawalModal from 'Components/WalletWithdrawalModal'
import MakerLogin from 'Components/Maker/Login'
import MakerDashboard from 'Components/Maker/Dashboard'
import MakerLoading from 'Components/Maker/Loading'
import MakerSwaps from 'Components/Maker/Swaps'
import MakerBalances from 'Components/Maker/Balances'
import MakerSettings from 'Components/Maker/Settings'
import MakerRegister from 'Components/Maker/Signup'
import MakerRegisterProfile from 'Components/Maker/SignupProfile'
import LlamaSecretModal from 'Components/Maker/LlamaSecretModal'
import CapacityDepositModal from 'Components/Maker/CapacityDepositModal'
import MakerSetup from 'Components/Maker/MakerSetup'
import MakerExchangeSetup from 'Components/Maker/BinanceSetup'
import MakerBalanceSetup from 'Components/Maker/BalanceSetup'
import { AuthenticatedRoute, AuthRoutes } from 'Components/Auth'

import {
  root, dashboard, rebalance, connect, viewOnlyAddress,
  tradeHistory, tradeDetail, swapWidget, assetDetail, assetIndex,
  affiliateLogin, affiliateSignup, affiliateDashboard, affiliateSettings,
  affiliatePayouts, affiliateSwaps, affiliateAccountModal,
  watchlist, trending, affiliateTerms, swapWidgetStepTwo, tradeWidgetDetail,
  connectMobileWallet, settings, affiliateAcceptTerms, wallets, walletDepositModal,
  walletWithdrawalModal, assetNews, makerLogin, makerDashboard, makerSwaps, makerSettings,
  makerLoading, makerBalances, makerRegister, makerRegisterProfile, makerAccountModal,
  makerSetup, makerExchangeSetup, makerBalanceSetup, capacityDepositModal
} from 'Routes'

const AppView = ({ hasNoWallets }) => {
  return (
    <Fragment>
      <Switch>
        <Route exact path={root.path} render={() => (
          hasNoWallets
            ? (<Redirect to='/connect' />)
            : (<Redirect to='/dashboard' />)
        )} />

        {/* Routes requiring a connected wallet */}
        <WalletOpened path={dashboard.path} component={Dashboard}/>
        <WalletOpened path={rebalance.path} component={Modify}/>
        <WalletOpened path={settings.path} component={Settings}/>
        <WalletOpened path={wallets.path} component={Wallets}/>

        {/* Routes that don't require a connected wallet */}
        <Route path={connect.path} component={Connect}/>
        <Route path={viewOnlyAddress.path} component={SearchResults}/>
        <Route path={swapWidget.path} component={SwapWidget} />
        <Route path={swapWidgetStepTwo.path} component={SwapWidgetStepTwo}/>
        <Route path={watchlist.path} component={AssetWatchlist}/>
        <Route path={assetNews.path} component={AssetNews} />
        <Route path={trending.path} component={AssetTrending}/>
        <Route path={assetDetail.path} component={AssetDetail}/>
        <Route path={assetIndex.path} component={AssetIndex}/>
        <Route path={affiliateLogin.path} component={AffiliateLogin}/>
        <Route path={affiliateSignup.path} component={AffiliateSignup}/>
        <Route path={affiliateDashboard.path} component={AffiliateDashboard}/>
        <Route path={affiliateSettings.path} component={AffiliateSettings}/>
        <Route path={affiliateAcceptTerms.path} component={AffiliateAcceptTerms}/>
        <Route path={affiliatePayouts.path} component={AffiliatePayouts}/>
        <Route path={affiliateSwaps.path} component={AffiliateSwaps}/>
        <Route path={affiliateTerms.path} component={AffiliateTerms}/>
        <Route path={tradeHistory.path} component={TradeHistory}/>

        <AuthRoutes path={'/makers/login/auth'} successPath={'/makers/login/loading'} />
        <AuthenticatedRoute path={makerLoading.path} component={MakerLoading} />
        <Route path={makerLogin.path} component={MakerLogin} />
        <Route path={makerRegisterProfile.path} component={MakerRegisterProfile} />
        <Route path={makerRegister.path} component={MakerRegister} />
        <Route path={makerSetup.path} component={MakerSetup} />
        <Route path={makerExchangeSetup.path} component={MakerExchangeSetup} />
        <Route path={makerBalanceSetup.path} component={MakerBalanceSetup} />
        <AuthenticatedRoute path={makerDashboard.path} component={MakerDashboard} />
        <AuthenticatedRoute path={makerSwaps.path} component={MakerSwaps} />
        <AuthenticatedRoute path={makerBalances.path} component={MakerBalances} />
        <AuthenticatedRoute path={makerSettings.path} component={MakerSettings} />
      
        {/* Legacy routes */}
        <Redirect exact from='/affiliates' to={affiliateLogin.path}/>
        <Redirect exact from='/balances' to={dashboard.path}/>
        <Redirect exact from='/modify' to={rebalance.path}/>

        {/* Fallback for unknown routes */}
        <Redirect to={dashboard.path}/>
      </Switch>

      {/* Routes that show a modal over one of the above pages */}
      <ModalRoute exact closePath={connect.path} path={connectMobileWallet.path} render={(props) => (
        <MobileWalletModal walletType={props.match.params.walletType} {...props}/>
      )}/>
      <ModalRoute exact closePath={tradeHistory.path} path={tradeDetail.path} render={(props) => (
        <TradeDetailModal tradeId={props.match.params.tradeId} {...props}/>
      )}/>
      <ModalRoute exact path={walletDepositModal.path} render={(props) => (
        <WalletDepositModal walletId={props.match.params.walletId} symbol={props.match.params.symbol} {...props}/>
      )}/>
      <ModalRoute exact path={walletWithdrawalModal.path} render={(props) => (
        <WalletWithdrawalModal walletId={props.match.params.walletId} symbol={props.match.params.symbol} {...props}/>
      )}/>
      <ModalRoute closePath={tradeHistory.path} path={tradeWidgetDetail.path} render={(props) => (
        <TradeDetailModal tradeId={props.match.params.tradeId} {...props}/>
      )}/>
      <ModalRoute closePath={affiliateDashboard.path} path={affiliateAccountModal.path} render={(props) => (
        <AffiliateAccountModal {...props}/>
      )}/>
      <ModalRoute closePath={makerDashboard.path} path={makerAccountModal.path} render={(props) => (
        <LlamaSecretModal {...props}/>
      )}/>
      <ModalRoute closePath={makerDashboard.path} path={capacityDepositModal.path} render={(props) => (
        <CapacityDepositModal {...props}/>
      )}/>
      <Footer />
    </Fragment>
  )
}

export default AppView
