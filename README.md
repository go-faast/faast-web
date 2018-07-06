# faast Portfolio

The open-source portfolio application featured on https://faa.st

## Production/Building/Development

### Prerequisites

[NPM](https://www.npmjs.com/) is required, please see the [website](https://docs.npmjs.com/getting-started/installing-node) for installation instructions.

### Serving application

To serve the application only, install **local-web-server** as follows:
```
npm install local-web-server
```

To start serving:
```
npm start
```

The application will be running at [https://localhost:8000](https://localhost:8000). To resolve the SSL warning follow [these steps](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate) to install the certificate.

### Building

For development and to build the application, you will need to install all of the modules:
```
npm install
```

Build the app:
```
npm run build
```

Files will be built to the **dist** folder. They can be served from your machine with:
```
npm start
```

### Development Server

The faast Portfolio is a React app that is bundled with Webpack. For easier development, the application can be run with the Webpack Dev Server. This allows live reloading on code changes. To start, run:
```
npm run dev
```

Once compiled, open [https://localhost:8080/portfolio](https://localhost:8080/portfolio) in your browser.

### Branches

The [OneFlow](http://endoflineblog.com/oneflow-a-git-branching-model-and-workflow) model will be followed as best as possible, with **develop** being the working branch and **master** pointing to the latest release tag.


### Testing

Instructions to come...

### Security

faast is a fully client side application. faast is never in control of user funds, and private keys never leave the browser, they are only used to sign transactions. This is similar to myetherwallet.com

faast never stores, transmits or otherwise knows of private keys. If you are interesting in auditing this, you can find the wallet handling logic located in src/services/Wallet/lib.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Hats off to [MyEtherWallet](https://www.myetherwallet.com/) for strategies on working with hardware wallets.
