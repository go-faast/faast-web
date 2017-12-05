# faast Portfolio

The open-source portfolio application featured on https://faa.st

## Getting Started

To run the application from your machine, download and open the **index.html** file.
You may also serve the file to your local network, instructions follow below:

## Production/Building/Development

### Prerequisites

[NPM](https://www.npmjs.com/) is required, please see the [website](https://docs.npmjs.com/getting-started/installing-node) for installation instructions.

### Serving application

To serve the application only, install the **serve** module as follows:
```
npm install --production
```

To start serving:
```
npm run start
```

The application will open on your default browser.

### Building

For development and the build the application, you will need to install all of the modules:
```
npm install
```

Build the code:
```
npm run build
```

Files will be built to the **dist** folder. You may then open **dist/index.html** directly, or serve the files from your machine with:
```
npm run start
```

### Development Server

The faast Portfolio is a React app that is bundled with Webpack. For easier development, the application can be run with the Webpack Dev Server. This allows live reloading on code changes. To start, run:
```
npm run dev
```

Once compiled, the browser will open to **http://localhost:5000#dev**. The **#dev** hash indicates that the bundle should be read from the Webpack Dev Server on port 8080.

### Branches

The [OneFlow](http://endoflineblog.com/oneflow-a-git-branching-model-and-workflow) model will be followed as best as possible, with **develop** being the working branch and **master** pointing to the latest release tag.


### Testing

Instructions to come...

### Security

faast is a fully client side application. faast is never in control of user funds, and private keys never leave the browser, they are only used to sign transactions. This is similar to myetherwallet.com

faast never stores, transmits or otherwise knows of private keys. If you are interesting in auditing this, it is best to start from the where the private key is decrypted from the wallet file. This can be done by:
1. Go do src/app/controllers/SignTxModalController.jsx
2. Follow the use of object "pk" (privatekey) which is returned from getPrivateKeyString()
3. Make sure that neither "pk" nor "values.password" is sent or transmitted anywhere (hint: it isn't)

For those who still do not trust the application, we suggest the use of a Trezor or Ledger hardware wallet. When using a hardware wallet, faast generates a transaction which is sent to the wallet for signing. The private key can never leave the hardware wallet.

Wallet generation is also possible on faast. This is done using the src/utilities/wallet.js generateWallet() function. Wallet generation is done through the ethereumjs-wallet library.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Hats off to [MyEtherWallet](https://www.myetherwallet.com/) for strategies on working with hardware wallets.
