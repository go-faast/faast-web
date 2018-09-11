# Faast Portfolio

[![Package version](https://img.shields.io/badge/dynamic/json.svg?label=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fgo-faast%2Ffaast-portfolio%2Fdevelop%2Fpackage.json&query=%24.version&colorB=blue&prefix=v)](https://github.com/go-faast/faast-portfolio/blob/develop/package.json)
[![GitHub license](https://img.shields.io/github/license/go-faast/faast-portfolio.svg)](https://github.com/go-faast/faast-portfolio/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/go-faast/faast-portfolio.svg?branch=develop)](https://travis-ci.org/go-faast/faast-portfolio)

A decentralized cryptocurrency portfolio manager and exchange interface
<https://faa.st/portfolio>

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

For development and to build the application, you will need to install all of the modules:

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

### Development

The faast Portfolio is a React app that is bundled with Webpack. For easier development, the application can be run with the Webpack Dev Server. This allows live reloading on code changes. To start, run:

```bash
npm run dev
```

Once compiled, open [https://localhost:8080/portfolio](https://localhost:8080/portfolio) in your browser.

To resolve the SSL warning you have the following options:

#### On MacOS

1. Go to `Applications -> Keychain Access`
2. `File -> Import Items`
3. Import `faast-portfolio -> node_modules -> webpack-dev-server -> ssl -> server.pem`
4. Double click newly imported item in Keychain Access (most likely named 'localhost') to open options
5. `Trust -> Set: When using this certificate to 'Always Trust'`

#### On Google Chrome Browser

1. Visit [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost) and set the property to `Enabled`.

### Branches

The [OneFlow](http://endoflineblog.com/oneflow-a-git-branching-model-and-workflow) model will be followed as best as possible, with **develop** being the working branch and **master** pointing to the latest release tag.

### Testing

Run:

```bash
npm run test
```

### Security

Faast is a fully client side application. Faast is never in control of user funds, and private keys never leave the browser, they are only used to sign transactions. This is similar to myetherwallet.com

Faast never stores, transmits or otherwise knows of private keys. If you are interesting in auditing this, you can find the wallet handling logic located in src/services/Wallet.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
