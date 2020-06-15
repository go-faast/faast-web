const siteName = 'Faa.st'
const titleSuffix = `- ${siteName}`

const genericTitle = `${siteName} is the safest and fastest way to trade crypto directly from your hardware or software wallet.`

module.exports = {
  name: siteName,
  author: 'Bitaccess',
  title: `${siteName} - Swap Crypto Directly from Your Wallet`,
  description: `${genericTitle} Quickly build a crypto portfolio of assets including Bitcoin, Ethereum, Litecoin, Monero, and more. Connect your wallet and instantly begin trading for near-zero fees.`,
  year: new Date().getFullYear(),
  pageMeta: {
    supportedAssets: () => ({
      title: `Supported Assets ${titleSuffix}`,
      description: `A comprehensive list of crypto assets currently available to swap on ${siteName}.`,
    }),
    asset: ({ type, name, symbol }) => ({
      title: `Instantly ${type} ${name} (${symbol}) ${titleSuffix}`,
      description: `Safely trade your ${name} crypto directly from your hardware or software wallet. View ${name} (${symbol}) pricing charts, market cap, daily volume and other coin data.`,
    }),
    wallet: ({ name }) => ({
      title: `Swap Crypto Directly from your ${name} Wallet ${titleSuffix}`,
      description: `Simply connect your ${name} Wallet and instantly begin trading for near-zero fees.`,
    }),
    blog: () => ({
      title: `Cryptocurrency Market Blog ${titleSuffix}`,
      description: `Learn how to trade your crypto directly from your wallet on ${siteName} and topics involving regulation, pricing, wallets, mining, and more.`,
    }),
    blogPost: ({ post }) => ({
      title: `${post.title} - Blog ${titleSuffix}`,
      description: `${post.virtuals.subtitle}`,
    }),
    marketMaker: () => ({
      title: `Market Maker Program (Beta) ${titleSuffix}`,
      description: `Earn interest and grow your Bitcoin holdings by fulfilling trades placed on the ${siteName}. Sign up for the Beta now ${titleSuffix}`,
    }),
    affiliate: () => ({
      title: `Affiliate Partnerships ${titleSuffix}`,
      description: "Learn how to earn fees in Bitcoin by integrating Faa.st's API into your crypto exchange, mobile app, or website.",
    }),
    terms: () => ({
      title: `Terms & Conditions ${titleSuffix}`,
      description: genericTitle,
    }),
    privacy: () => ({
      title: `Privacy Policy ${titleSuffix}`,
      description: genericTitle,
    }),
    lawEnforcement: () => ({
      title: `Law Enforcement Support ${titleSuffix}`,
      description: 'Search for the Faa.st swap history of a specific wallet address using the Faast API.',
    }),
    newsletter: () => ({
      title: `Keep up with Crypto and Sign Up for the ${siteName} Newsletter`,
      description: `Subscribe to our newsletter to stay up-to-date with the ${siteName} decentralized crypto exchange.`,
    }),
    pricing: () => ({
      title: `Exchange Fees and Pricing ${titleSuffix}`,
      description: `${siteName} enables users to trade crypto from their wallet for low and transparent fees.`,
    }),
    notFound: () => ({
      title: `404 Not Found ${titleSuffix}`,
      description: 'Sorry, unable to find the page you were looking for.',
    })
  }
}
