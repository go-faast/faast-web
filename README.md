# Faast

[![Package version](https://img.shields.io/badge/dynamic/json.svg?label=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fgo-faast%2Ffaast-portfolio%2Fdevelop%2Fpackage.json&query=%24.version&colorB=blue&prefix=v)](https://github.com/go-faast/faast-portfolio/blob/develop/package.json)
[![GitHub license](https://img.shields.io/github/license/go-faast/faast-portfolio.svg)](https://github.com/go-faast/faast-portfolio/blob/develop/LICENSE)
[![Build Status](https://travis-ci.org/go-faast/faast-portfolio.svg?branch=develop)](https://travis-ci.org/go-faast/faast-portfolio)

A decentralized cryptocurrency portfolio manager and exchange.
<https://faa.st>

This repository contains code for both the Faast [static website](https://faa.st) and [single page application](https://faa.st/app). Both are built using React.

## Usage

### Prerequisites

[NPM](https://www.npmjs.com/) is required, please see the [website](https://docs.npmjs.com/getting-started/installing-node) for installation instructions.

### Running

This repository includes a prebuilt version of the application located in `dist`. To run it you'll need to install **local-web-server**:

```bash
npm install local-web-server
```

Then start the application with:

```bash
npm start
```

Then open [https://localhost:8000](https://localhost:8000). To resolve the SSL warning follow [these steps](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate) to install the certificate.

### Building

To build the application, you will need to install all of the modules:

```bash
npm install
```

Build the app:

```bash
npm run build
```

Files will be built to the **dist** folder. They can be served from your machine with:

```bash
npm start
```

## Contributing

### Development Server

The static website is built using react-static, which uses webpack under the hood. And the single page app is built directly with Webpack. For easier development, both can be run with webpack dev server. This allows live reloading on code changes. To start both dev servers behind a frontend proxy, run:

```bash
npm run dev
```

Once compiled, open [http://localhost:8000](http://localhost:8080) in your browser.

This concurrently runs the following:

- `npm run dev:site` -> Start dev server for static website at <http://localhost:3000>
- `npm run dev:app` -> Start dev server for single page app at <http://localhost:8080/app>
- `npm run dev:proxy` -> Provide a proxy to both dev servers at <http://localhost:8000>

#### HTTPS

To run the development server over https use `HTTPS=true npm run dev`

To resolve the SSL warning follow [these steps](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate).

or on Google Chrome Browser visit [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost) and set the property to `Enabled`.

### Branches

The [OneFlow](http://endoflineblog.com/oneflow-a-git-branching-model-and-workflow) model will be followed as best as possible, with **develop** being the working branch and **master** pointing to the latest release tag.

### Testing

Run:

```bash
npm run test
```

### New Currency Checklist

1. Implement the `Wallet` abstraction which specifies how to load balances, generate/sign transactions, etc. (see `src/services/Wallet/lib/Wallet.ts`)
    - If the currency is Bitcoin based and has bitcore support, you can implement `BitcoreWallet` instead. For an example refer to one of the existing implementations for Bitcoin/Litecoin.
1. Update `src/services/Wallet/lib/WalletSerializer.ts`
1. Update `src/utilities/walletIcon.js`
1. Update `src/app/components/ConfirmTransactionModal/index.jsx`
1. Update explorer URLs `src/config/index.js`
1. If hardware wallet based:
    - Update `src/app/actions/connectHardwareWallet.js`
    - Add default derivation path `src/config/walletTypes.js`
    - If export flow differs from Bitcoin, add instruction override in `src/app/components/HardwareWalletModal/ConnectionInstructions.jsx`
1. If not hardware wallet based:
    - Add new access tile `src/app/components/Access`
    - Create custom action to connect to the wallet `src/app/actions/access.js`
  

## Security

Faast is a fully client side application. Faast is never in control of user funds, and private keys never leave the browser, they are only used to sign transactions. This is similar to myetherwallet.com

Faast never stores, transmits or otherwise knows of private keys. If you are interesting in auditing this, you can find the wallet handling logic located in src/services/Wallet.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
