(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("recompose");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("react-static");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cacheProm = exports.loadFromPromiseCache = exports.cacheExport = exports.loadFromCache = exports.callForString = exports.createElement = exports.findExport = exports.resolveExport = exports.requireById = exports.tryRequire = exports.DefaultError = exports.DefaultLoading = exports.babelInterop = exports.isWebpack = exports.isServer = exports.isTest = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isTest = exports.isTest = "production" === 'test';
var isServer = exports.isServer = !(typeof window !== 'undefined' && window.document && window.document.createElement);

var isWebpack = exports.isWebpack = function isWebpack() {
  return typeof __webpack_require__ !== 'undefined';
};
var babelInterop = exports.babelInterop = function babelInterop(mod) {
  return mod && (typeof mod === 'undefined' ? 'undefined' : _typeof(mod)) === 'object' && mod.__esModule ? mod.default : mod;
};

var DefaultLoading = exports.DefaultLoading = function DefaultLoading() {
  return _react2.default.createElement(
    'div',
    null,
    'Loading...'
  );
};
var DefaultError = exports.DefaultError = function DefaultError(_ref) {
  var error = _ref.error;
  return _react2.default.createElement(
    'div',
    null,
    'Error: ',
    error && error.message
  );
};

var tryRequire = exports.tryRequire = function tryRequire(id) {
  try {
    return requireById(id);
  } catch (err) {
    // warn if there was an error while requiring the chunk during development
    // this can sometimes lead the server to render the loading component.
    if (false) {
      console.warn('chunk not available for synchronous require yet: ' + id + ': ' + err.message, err.stack);
    }
  }

  return null;
};

var requireById = exports.requireById = function requireById(id) {
  if (!isWebpack() && typeof id === 'string') {
    return module.require(id);
  }

  return __webpack_require__(id);
};

var resolveExport = exports.resolveExport = function resolveExport(mod, key, onLoad, chunkName, props, context, modCache) {
  var isSync = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

  var exp = findExport(mod, key);
  if (onLoad && mod) {
    var _isServer = typeof window === 'undefined';
    var info = { isServer: _isServer, isSync: isSync };
    onLoad(mod, info, props, context);
  }
  if (chunkName && exp) cacheExport(exp, chunkName, props, modCache);
  return exp;
};

var findExport = exports.findExport = function findExport(mod, key) {
  if (typeof key === 'function') {
    return key(mod);
  } else if (key === null) {
    return mod;
  }

  return mod && (typeof mod === 'undefined' ? 'undefined' : _typeof(mod)) === 'object' && key ? mod[key] : babelInterop(mod);
};

var createElement = exports.createElement = function createElement(Component, props) {
  return _react2.default.isValidElement(Component) ? _react2.default.cloneElement(Component, props) : _react2.default.createElement(Component, props);
};

var callForString = exports.callForString = function callForString(strFun, props) {
  return typeof strFun === 'function' ? strFun(props) : strFun;
};

var loadFromCache = exports.loadFromCache = function loadFromCache(chunkName, props, modCache) {
  return !isServer && modCache[callForString(chunkName, props)];
};

var cacheExport = exports.cacheExport = function cacheExport(exp, chunkName, props, modCache) {
  return modCache[callForString(chunkName, props)] = exp;
};

var loadFromPromiseCache = exports.loadFromPromiseCache = function loadFromPromiseCache(chunkName, props, promisecache) {
  return promisecache[callForString(chunkName, props)];
};

var cacheProm = exports.cacheProm = function cacheProm(pr, chunkName, props, promisecache) {
  return promisecache[callForString(chunkName, props)] = pr;
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

var _reactStatic = __webpack_require__(3);

var _recompose = __webpack_require__(1);

var _config = __webpack_require__(21);

var _config2 = _interopRequireDefault(_config);

var _EmailSubscriptionForm = __webpack_require__(22);

var _EmailSubscriptionForm2 = _interopRequireDefault(_EmailSubscriptionForm);

var _IconCarousel = __webpack_require__(23);

var _IconCarousel2 = _interopRequireDefault(_IconCarousel);

var _trezor = __webpack_require__(26);

var _trezor2 = _interopRequireDefault(_trezor);

var _ledger = __webpack_require__(27);

var _ledger2 = _interopRequireDefault(_ledger);

var _mist = __webpack_require__(28);

var _mist2 = _interopRequireDefault(_mist);

var _metamask = __webpack_require__(29);

var _metamask2 = _interopRequireDefault(_metamask);

var _status = __webpack_require__(30);

var _status2 = _interopRequireDefault(_status);

var _coinbase = __webpack_require__(31);

var _coinbase2 = _interopRequireDefault(_coinbase);

var _trust = __webpack_require__(32);

var _trust2 = _interopRequireDefault(_trust);

var _mew = __webpack_require__(33);

var _mew2 = _interopRequireDefault(_mew);

var _secure = __webpack_require__(34);

var _secure2 = _interopRequireDefault(_secure);

var _simple = __webpack_require__(35);

var _simple2 = _interopRequireDefault(_simple);

var _privacy = __webpack_require__(36);

var _privacy2 = _interopRequireDefault(_privacy);

var _addWallet = __webpack_require__(37);

var _addWallet2 = _interopRequireDefault(_addWallet);

var _viewDashboard = __webpack_require__(38);

var _viewDashboard2 = _interopRequireDefault(_viewDashboard);

var _swapFunds = __webpack_require__(39);

var _swapFunds2 = _interopRequireDefault(_swapFunds);

var _moonBackground = __webpack_require__(40);

var _moonBackground2 = _interopRequireDefault(_moonBackground);

var _macbookScreenshot = __webpack_require__(41);

var _macbookScreenshot2 = _interopRequireDefault(_macbookScreenshot);

var _macbookScreenshot3 = __webpack_require__(42);

var _macbookScreenshot4 = _interopRequireDefault(_macbookScreenshot3);

var _bitaccess = __webpack_require__(43);

var _bitaccess2 = _interopRequireDefault(_bitaccess);

var _faastLogo64x = __webpack_require__(44);

var _faastLogo64x2 = _interopRequireDefault(_faastLogo64x);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* tslint:disable:max-line-length */
exports.default = (0, _recompose.compose)((0, _recompose.setDisplayName)('Home'), _reactStatic.withRouteData, (0, _recompose.withProps)(function (_ref) {
  var assets = _ref.assets;
  return {
    supportedAssets: assets.filter(function (_ref2) {
      var deposit = _ref2.deposit,
          receive = _ref2.receive;
      return deposit || receive;
    })
  };
}))(function (_ref3) {
  var supportedAssets = _ref3.supportedAssets;
  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      null,
      React.createElement(
        'nav',
        { className: 'navbar navbar-dark navbar-expand-md navigation-clean-button', style: { backgroundColor: 'transparent', paddingLeft: '12px' } },
        React.createElement(
          'div',
          { className: 'container' },
          React.createElement(
            _reactStatic.Link,
            { exact: true, to: '/', className: 'navbar-brand text-white', style: { fontWeight: 400 } },
            React.createElement('img', { src: _faastLogo64x2.default, style: { height: '32px', marginRight: '16px' } }),
            _config2.default.name
          ),
          React.createElement(
            'button',
            { className: 'navbar-toggler', 'data-toggle': 'collapse', 'data-target': '#navcol-1' },
            React.createElement(
              'span',
              { className: 'sr-only' },
              'Toggle navigation'
            ),
            React.createElement('span', { className: 'navbar-toggler-icon text-white' })
          ),
          React.createElement(
            'div',
            { className: 'collapse navbar-collapse', id: 'navcol-1' },
            React.createElement(
              'ul',
              { className: 'nav navbar-nav ml-auto' },
              React.createElement(
                'li',
                { className: 'nav-item', role: 'presentation' },
                React.createElement(
                  'a',
                  { className: 'nav-link text-light', href: '/app/swap' },
                  'Swap'
                )
              ),
              React.createElement(
                'li',
                { className: 'nav-item', role: 'presentation' },
                React.createElement(
                  'a',
                  { className: 'nav-link text-light', href: 'https://medium.com/faast', target: '_blank', rel: 'noopener' },
                  'Blog'
                )
              ),
              React.createElement(
                'li',
                { className: 'nav-item', role: 'presentation' },
                React.createElement(
                  'a',
                  { className: 'nav-link py-1', href: '/app' },
                  React.createElement(
                    'button',
                    { className: 'btn btn-light' },
                    'Portfolio'
                  )
                )
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'jumbotron jumbotron-fluid hero-technology mb-0', style: {
            backgroundImage: 'url(' + _moonBackground2.default + ')',
            height: '759px',
            backgroundPosition: '50% 25px',
            backgroundSize: '1400px',
            backgroundRepeat: 'no-repeat',
            marginTop: '-160px',
            paddingTop: '220px',
            backgroundColor: 'rgba(0,26,23)'
          } },
        React.createElement(
          'h1',
          { className: 'hero-title', style: { fontWeight: 'normal' } },
          'Trade Crypto'
        ),
        React.createElement(
          'p',
          { className: 'hero-subtitle', style: { fontWeight: 'normal', width: '90%' } },
          'It\u2019s never been this easy to build a diversified cryptocurrency portfolio',
          React.createElement('br', null)
        ),
        React.createElement(
          'p',
          null,
          React.createElement(
            'a',
            { className: 'btn btn-light btn-lg hero-button py-2', role: 'button', href: '/portfolio' },
            'Create A Portfolio'
          )
        ),
        React.createElement(
          'div',
          { className: 'intro', style: { paddingTop: '60px' } },
          React.createElement('img', { className: 'img-fluid', src: _macbookScreenshot2.default, style: { height: '100%', width: '730px' } })
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'features-clean' },
      React.createElement(
        'div',
        { className: 'container', style: { paddingTop: '100px' } },
        React.createElement(
          'h2',
          { className: 'text-center', style: { marginBottom: '75px', fontWeight: 'normal' } },
          'Instantly build a cryptocurrency portfolio'
        ),
        React.createElement(
          'div',
          { className: 'row features' },
          React.createElement(
            'div',
            { className: 'col-sm-12 col-md-4 col-lg-4 item' },
            React.createElement('i', { className: 'far fa-check-circle icon', style: { color: '#01B69B' } }),
            React.createElement(
              'h3',
              { className: 'name', style: { fontWeight: 'normal' } },
              'Safe & Secure',
              React.createElement('br', null)
            ),
            React.createElement(
              'p',
              { className: 'description', style: { fontSize: '16px' } },
              'Trade directly from your wallet\u2014 we never control your funds or see your private key.',
              React.createElement('br', null)
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-12 col-md-4 col-lg-4 item' },
            React.createElement('i', { className: 'far fa-check-circle icon', style: { color: '#01B69B' } }),
            React.createElement(
              'h3',
              { className: 'name', style: { fontWeight: 'normal' } },
              'No Sign Up Required',
              React.createElement('br', null)
            ),
            React.createElement(
              'p',
              { className: 'description', style: { fontSize: '16px' } },
              'No need to register or share any personal info.',
              React.createElement('br', null)
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-12 col-md-4 col-lg-4 item' },
            React.createElement('i', { className: 'far fa-check-circle icon', style: { color: '#01B69B' } }),
            React.createElement(
              'h3',
              { className: 'name', style: { fontWeight: 'normal' } },
              'Lightning Fast',
              React.createElement('br', null)
            ),
            React.createElement(
              'p',
              { className: 'description', style: { fontSize: '16px' } },
              'With instant access to over 100+ coins!',
              React.createElement('br', null)
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'row justify-content-center' },
          React.createElement(
            'div',
            { className: 'col-md-12 col-lg-8', style: { paddingTop: '20px' } },
            React.createElement(
              'h5',
              { className: 'text-center text-body' },
              React.createElement(
                'strong',
                null,
                'No deposit fees. No subscription fees. No exit fees. Faast is a simple, low cost on-chain trading engine.'
              )
            )
          ),
          React.createElement('div', { className: 'w-100' }),
          React.createElement(
            'div',
            { className: 'col-12 col-md-12 col-lg-8 col-xl-8' },
            React.createElement(
              'h3',
              { className: 'text-center text-dark', style: { marginTop: '3rem' } },
              'Leave more in your wallet'
            ),
            React.createElement(
              'p',
              { className: 'text-center', style: { marginTop: '0.5rem', marginBottom: '2rem' } },
              'Amount received from trading $100 of Aragon for Aeternity'
            ),
            React.createElement(
              'div',
              { style: { height: '64px', backgroundColor: '#00d7b8', marginBottom: '20px', width: '90%' } },
              React.createElement(
                'h6',
                { className: 'text-dark mb-2', style: { marginLeft: '8px', paddingTop: '8px' } },
                'Faast'
              ),
              React.createElement(
                'p',
                { className: 'text-dark', style: { marginLeft: '8px' } },
                React.createElement(
                  'strong',
                  null,
                  '$95.80'
                ),
                React.createElement('br', null)
              )
            ),
            React.createElement(
              'div',
              { style: { height: '64px', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '40%' } },
              React.createElement(
                'h6',
                { className: 'text-dark mb-2', style: { marginLeft: '8px', paddingTop: '8px' } },
                'Kyber Network',
                React.createElement('br', null)
              ),
              React.createElement(
                'p',
                { className: 'text-dark', style: { marginLeft: '8px' } },
                React.createElement(
                  'strong',
                  null,
                  '$90.79'
                ),
                React.createElement('br', null)
              )
            ),
            React.createElement(
              'div',
              { style: { height: '64px', backgroundColor: '#E3E5E8', marginBottom: '20px', width: '30%' } },
              React.createElement(
                'h6',
                { className: 'text-dark mb-2', style: { marginLeft: '8px', paddingTop: '8px' } },
                'Binance & Bittrex',
                React.createElement('br', null)
              ),
              React.createElement(
                'p',
                { className: 'text-dark', style: { marginLeft: '8px' } },
                React.createElement(
                  'strong',
                  null,
                  '$89.91'
                ),
                React.createElement('br', null)
              )
            ),
            React.createElement(
              'p',
              { className: 'text-center', style: { marginTop: '2rem', marginBottom: '3rem' } },
              React.createElement(
                'small',
                null,
                'Method: this graph shows the estimated amount received from trading $100 worth of Aragon (ANT) for Aeternity (AE) using Faast versus other popular cryptocurrency providers. Click ',
                React.createElement(
                  'a',
                  { className: 'text-dark', href: 'https://medium.com/faast/binance-vs-kyber-vs-faast-which-exchange-will-save-you-the-most-money-e19972dd11df', target: '_blank' },
                  'here'
                ),
                ' to learn more.'
              )
            ),
            React.createElement(
              'p',
              { className: 'lead text-center py-3 px-3 mb-4', style: { backgroundColor: '#F3F5F8' } },
              React.createElement(
                'a',
                { className: 'text-dark', href: 'https://medium.com/faast/binance-vs-kyber-vs-faast-which-exchange-will-save-you-the-most-money-e19972dd11df', target: '_blank' },
                'Read our Medium post on end-to-end price comparisons'
              )
            )
          )
        ),
        React.createElement('div', { className: 'row' })
      )
    ),
    React.createElement(
      'div',
      { className: 'py-4', style: { backgroundColor: '#015247' } },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'row align-items-center' },
          React.createElement(
            'div',
            { className: 'col-auto text-center px-5 py-4 d-none d-md-block', style: { borderRight: 'solid 2px #0D342E' } },
            React.createElement(
              'h1',
              { className: 'currency-count text-white font-weight-bold' },
              supportedAssets.length
            ),
            React.createElement(
              'h4',
              { className: 'text-light mb-0' },
              'Coins Supported'
            )
          ),
          React.createElement(
            'div',
            { className: 'col-12 text-center py-3 d-md-none' },
            React.createElement(
              'h1',
              { className: 'currency-count text-white font-weight-bold' },
              supportedAssets.length,
              ' ',
              React.createElement(
                'small',
                null,
                'Coins Supported'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'col px-2' },
            React.createElement(_IconCarousel2.default, { items: supportedAssets.map(function (_ref4) {
                var symbol = _ref4.symbol,
                    name = _ref4.name,
                    iconUrl = _ref4.iconUrl;
                return {
                  key: symbol,
                  label: React.createElement(
                    'p',
                    null,
                    name
                  ),
                  iconUrl: iconUrl,
                  link: '/app/assets/' + symbol
                };
              }) })
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'highlight-phone slick-interface-section' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'row align-items-center' },
          React.createElement(
            'div',
            { className: 'col-md-6 col-lg-5 col-xl-5 offset-md-0 offset-lg-0 offset-xl-1 align-self-center', style: { marginBottom: '0px' } },
            React.createElement(
              'div',
              { className: 'intro' },
              React.createElement(
                'h2',
                { className: 'text-white', style: { fontWeight: 'normal', marginBottom: '20px' } },
                'Slick & Simple Interface'
              ),
              React.createElement(
                'p',
                { className: 'text-white', style: { marginBottom: '30px' } },
                'With our unique and intuitive ',
                React.createElement(
                  'strong',
                  null,
                  '\u2018click-and-drag\u2019 slider\xA0interface'
                ),
                ', you can visually allocate how much of any coin you want to toward a trade\u2014 swap multiple coins at once, and build a diversified portfolio in seconds with only a single transaction.',
                React.createElement('br', null)
              ),
              React.createElement(
                'a',
                { className: 'btn btn-light active', role: 'button', href: '/portfolio' },
                'Start Trading'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-12 col-md-6 col-lg-7 col-xl-6 offset-md-0 offset-lg-0 offset-xl-0 align-self-center', style: { paddingTop: '30px' } },
            React.createElement('img', { className: 'img-fluid', src: _macbookScreenshot4.default, style: { marginTop: '0px' } })
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'text-white mt-5' },
      React.createElement(
        'p',
        { className: 'lead text-center text-muted', style: { marginTop: '0px', marginBottom: '20px' } },
        'Supported Wallets',
        React.createElement('br', null)
      ),
      React.createElement(
        'div',
        { className: 'row no-gutters justify-content-center' },
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect/hw/trezor' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _trezor2.default, alt: 'trezor' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'TREZOR'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect/hw/ledger' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _ledger2.default, alt: 'ledger logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Ledger Wallet'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _metamask2.default, alt: 'metamask logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'MetaMask'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _mist2.default, alt: 'mist logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Mist'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _trust2.default, alt: 'trust wallet logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Trust Wallet'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _coinbase2.default, alt: 'coinbase wallet logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Coinbase Wallet'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _status2.default, alt: 'status logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Status'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'col-auto' },
          React.createElement(
            'a',
            { className: 'd-block text-white', href: '/portfolio/connect' },
            React.createElement('img', { className: 'rounded wallet-logo', src: _mew2.default, alt: 'my ether wallet logo' }),
            React.createElement(
              'p',
              { className: 'text-center pt-2' },
              'Keystore'
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'team-clean mt-5' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement('div', { className: 'intro' }),
        React.createElement(
          'div',
          { className: 'row people' },
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-4 item pt-2r' },
            React.createElement('img', { src: _secure2.default, style: { height: '161px', width: '316px', backgroundColor: 'rgba(243,245,248,0)', padding: '25px' } }),
            React.createElement(
              'h5',
              { className: 'name', style: { fontWeight: 'normal' } },
              'Secure'
            ),
            React.createElement(
              'p',
              { className: 'description' },
              'The safest trading method in the world\u2014 we don\u2019t have your money; if we got hacked, you\u2019d lose nothing.',
              React.createElement('br', null)
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-4 offset-md-3 offset-lg-0 item ml-0 pt-2r' },
            React.createElement('img', { src: _simple2.default, style: { width: '306px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)', height: '161px' } }),
            React.createElement(
              'h5',
              { className: 'name', style: { fontWeight: 'normal' } },
              'Simple'
            ),
            React.createElement('p', { className: 'title' }),
            React.createElement(
              'p',
              { className: 'description' },
              'Intuitive and mobile friendly UI makes crypto trading simple and easy.',
              React.createElement('br', null)
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-4 item pt-2r' },
            React.createElement('img', { className: 'rounded-circle', src: _privacy2.default, style: { width: '234px', height: '161px', padding: '36px', backgroundColor: 'rgba(243,245,248,0)' } }),
            React.createElement(
              'h5',
              { className: 'name', style: { fontWeight: 'normal' } },
              'Private'
            ),
            React.createElement(
              'p',
              { className: 'description' },
              'You don\u2019t need to share personal data, photo ID, or anything else\u2014 just safe and confidential trades.',
              React.createElement('br', null)
            )
          ),
          React.createElement(
            'div',
            { className: 'col' },
            React.createElement('hr', { style: { height: '-1px', backgroundColor: 'rgba(0,0,0,0.15)', marginTop: '30px' } }),
            React.createElement(
              'h2',
              { className: 'text-center name', style: { marginTop: '30px', fontWeight: 'normal' } },
              'Get started in minutes'
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'features-boxed', style: { backgroundColor: '#ffffff' } },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement('div', { className: 'intro' }),
        React.createElement(
          'div',
          { className: 'row justify-content-center features', style: { paddingTop: '0px', marginTop: '-60px' } },
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-3 item' },
            React.createElement(
              'div',
              { className: 'box' },
              React.createElement('img', { src: _addWallet2.default, style: { marginBottom: '23px' } }),
              React.createElement(
                'h3',
                { className: 'name', style: { fontWeight: 'normal' } },
                'Add Wallet'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-3 item' },
            React.createElement(
              'div',
              { className: 'box' },
              React.createElement('img', { src: _viewDashboard2.default, style: { marginBottom: '30px' } }),
              React.createElement(
                'h3',
                { className: 'name', style: { fontWeight: 'normal' } },
                'View Dashboard'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'col-sm-4 col-md-4 col-lg-3 item' },
            React.createElement(
              'div',
              { className: 'box' },
              React.createElement('img', { src: _swapFunds2.default, style: { marginBottom: '20px' } }),
              React.createElement(
                'h3',
                { className: 'name', style: { fontWeight: 'normal' } },
                'Swap Funds'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'col-md-4 col-lg-4 col-xl-4 offset-md-0 offset-lg-0 offset-xl-0', style: { paddingTop: '10px' } },
            React.createElement(
              'a',
              { className: 'btn btn-dark btn-block btn-lg hero-button', role: 'button', href: '/portfolio' },
              'Get Started'
            )
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'newsletter-subscribe', style: { backgroundColor: '#181818' } },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'text-center w-100 mb-4' },
          React.createElement(
            'p',
            { className: 'text-white' },
            'Vote for us on Product Hunt'
          ),
          React.createElement('iframe', { src: 'https://yvoschaap.com/producthunt/counter.html#href=https%3A%2F%2Fwww.producthunt.com%2Fr%2Fp%2F114880&layout=tall', width: '56px', height: '65px', scrolling: 'no', frameBorder: 0 })
        ),
        React.createElement(_EmailSubscriptionForm2.default, null)
      )
    ),
    React.createElement(
      'div',
      { className: 'brands' },
      React.createElement(
        'a',
        { className: 'text-white-50', href: 'https://bitaccess.ca/', target: '_blank', style: { backgroundColor: '#364B5E', height: '185px', textDecoration: 'none' } },
        React.createElement(
          'p',
          { className: 'text-center text-white' },
          'Made by the team at',
          React.createElement('br', null)
        ),
        React.createElement('img', { src: _bitaccess2.default, style: { marginTop: '0px' } })
      )
    ),
    React.createElement(
      'div',
      { className: 'footer-clean', style: { backgroundColor: 'rgb(24,24,24)', paddingTop: '0px', height: '394px' } },
      React.createElement(
        'footer',
        null,
        React.createElement(
          'div',
          { className: 'container', style: { paddingTop: '40px' } },
          React.createElement(
            'div',
            { className: 'row no-gutters' },
            React.createElement(
              'div',
              { className: 'col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item' },
              React.createElement(
                'h3',
                { style: { fontWeight: 'normal', color: '#00d7b8' } },
                'Faast'
              ),
              React.createElement(
                'ul',
                null,
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: '/portfolio', target: '_blank' },
                    'Portfolio'
                  )
                ),
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: '/portfolio/swap', target: '_blank' },
                    'Swap'
                  )
                ),
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: 'https://medium.com/faast', target: '_blank' },
                    'Blog'
                  )
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item' },
              React.createElement(
                'h3',
                { style: { fontWeight: 'normal', color: 'rgb(251,181,18)' } },
                'Bitaccess'
              ),
              React.createElement(
                'ul',
                null,
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: 'https://bitaccess.ca/about-us/', target: '_blank' },
                    'About Us'
                  )
                ),
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: '/terms', target: '_blank' },
                    'Terms of use'
                  )
                ),
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { className: 'text-white', href: '/privacy', target: '_blank' },
                    'Privacy Policy'
                  )
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'col-6 col-sm-6 col-md-2 col-xl-2 offset-md-2 offset-xl-1 item' },
              React.createElement(
                'h3',
                { className: 'text-light', style: { fontWeight: 'normal' } },
                'Contact'
              ),
              React.createElement(
                'ul',
                null,
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { href: 'mailto:support@faa.st', style: { color: 'rgb(255,255,255)' } },
                    'support@faa.st'
                  )
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item' },
              React.createElement(
                'h3',
                { className: 'text-light', style: { fontWeight: 'normal' } },
                'Links'
              ),
              React.createElement(
                'ul',
                null,
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { href: 'https://api.faa.st/', target: '_blank', style: { color: 'rgb(255,255,255)' } },
                    'API'
                  )
                ),
                React.createElement(
                  'li',
                  null,
                  React.createElement(
                    'a',
                    { href: '/static/faast-press-kit.zip', target: '_blank', style: { color: 'rgb(255,255,255)' } },
                    'Press Kit'
                  )
                ),
                React.createElement('li', null)
              )
            ),
            React.createElement(
              'div',
              { className: 'col-lg-12 col-xl-12 offset-lg-0 offset-xl-0 item social text-white', style: { minHeight: '0px', paddingRight: '0px', paddingLeft: '0px' } },
              React.createElement(
                'a',
                { href: 'https://github.com/go-faast' },
                React.createElement('i', { className: 'icon ion-social-github' })
              ),
              React.createElement(
                'a',
                { href: 'https://www.facebook.com/Faast-237787136707810', target: '_blank' },
                React.createElement('i', { className: 'icon ion-social-facebook' })
              ),
              React.createElement(
                'a',
                { href: 'https://twitter.com/gofaast' },
                React.createElement('i', { className: 'icon ion-social-twitter' })
              ),
              React.createElement(
                'a',
                { href: 'https://slack.faa.st/', target: '_blank' },
                React.createElement('i', { className: 'fab fa-slack-hash' })
              ),
              React.createElement(
                'a',
                { href: 'https://www.reddit.com/r/gofaast/', target: '_blank' },
                React.createElement('i', { className: 'icon ion-social-reddit' })
              ),
              React.createElement(
                'p',
                { className: 'lead text-white copyright' },
                '\xA9 ',
                _config2.default.year,
                ' ',
                _config2.default.author
              )
            )
          )
        )
      )
    )
  );
});
// import logoImg from 'Img/faast-logo.png'

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

var _recompose = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = (0, _recompose.compose)((0, _recompose.setDisplayName)('404'))(function () {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'h1',
      null,
      '404 - Oh no\'s! We couldn\'t find that page :('
    )
  );
});

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

var _reactDom = __webpack_require__(9);

var ReactDOM = _interopRequireWildcard(_reactDom);

var _Root = __webpack_require__(10);

var _Root2 = _interopRequireDefault(_Root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = _Root2.default;
// Render your app

if (typeof document !== 'undefined') {
    var renderMethod =  false ? ReactDOM.render : ReactDOM.hydrate || ReactDOM.render;
    var render = function render(Comp) {
        renderMethod(React.createElement(Comp, null), document.getElementById('root'));
    };
    // Render!
    render(_Root2.default);
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("react-dom");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

var _reactStatic = __webpack_require__(3);

var _reactHotLoader = __webpack_require__(11);

var _recompose = __webpack_require__(1);

var _reactStaticRoutes = __webpack_require__(12);

var _reactStaticRoutes2 = _interopRequireDefault(_reactStaticRoutes);

__webpack_require__(45);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = (0, _recompose.compose)((0, _recompose.setDisplayName)('Root'), (0, _reactHotLoader.hot)(module))(function () {
    return React.createElement(
        _reactStatic.Router,
        null,
        React.createElement(_reactStaticRoutes2.default, null)
    );
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("react-hot-loader");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _path2 = __webpack_require__(13);

var _path3 = _interopRequireDefault(_path2);

var _importCss2 = __webpack_require__(14);

var _importCss3 = _interopRequireDefault(_importCss2);

var _universalImport2 = __webpack_require__(15);

var _universalImport3 = _interopRequireDefault(_universalImport2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(16);

var _reactUniversalComponent = __webpack_require__(17);

var _reactUniversalComponent2 = _interopRequireDefault(_reactUniversalComponent);

var _reactStatic = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(0, _reactUniversalComponent.setHasBabelPlugin)();

var universalOptions = {
  loading: function loading() {
    return null;
  },
  error: function error(props) {
    console.error(props.error);
    return _react2.default.createElement(
      'div',
      null,
      'An error occurred loading this page\'s template. More information is available in the console.'
    );
  }
};

var t_0 = (0, _reactUniversalComponent2.default)((0, _universalImport3.default)({
  id: '../../src/site/pages/Home',
  file: '/Users/dylan/dev/ba/faast-portfolio/build/site/react-static-routes.js',
  load: function load() {
    return Promise.all([new Promise(function(resolve) { resolve(); }).then(__webpack_require__.bind(null, 6)), (0, _importCss3.default)('src/site/pages/Home', {
      disableWarnings: true
    })]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return _path3.default.join(__dirname, '../../src/site/pages/Home');
  },
  resolve: function resolve() {
    return /*require.resolve*/(6);
  },
  chunkName: function chunkName() {
    return 'src/site/pages/Home';
  }
}), universalOptions);
var t_1 = (0, _reactUniversalComponent2.default)((0, _universalImport3.default)({
  id: '../../src/site/pages/404',
  file: '/Users/dylan/dev/ba/faast-portfolio/build/site/react-static-routes.js',
  load: function load() {
    return Promise.all([new Promise(function(resolve) { resolve(); }).then(__webpack_require__.bind(null, 7)), (0, _importCss3.default)('src/site/pages/404', {
      disableWarnings: true
    })]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return _path3.default.join(__dirname, '../../src/site/pages/404');
  },
  resolve: function resolve() {
    return /*require.resolve*/(7);
  },
  chunkName: function chunkName() {
    return 'src/site/pages/404';
  }
}), universalOptions);

// Template Map
global.componentsByTemplateID = global.componentsByTemplateID || [t_0, t_1];

// Template Tree
global.templateIDsByPath = global.templateIDsByPath || {
  '404': 1

  // Get template for given path
};var getComponentForPath = function getComponentForPath(path) {
  path = (0, _reactStatic.cleanPath)(path);
  return global.componentsByTemplateID[global.templateIDsByPath[path]];
};

global.reactStaticGetComponentForPath = getComponentForPath;
global.reactStaticRegisterTemplateIDForPath = function (path, id) {
  global.templateIDsByPath[path] = id;
};

var Routes = function (_Component) {
  _inherits(Routes, _Component);

  function Routes() {
    _classCallCheck(this, Routes);

    return _possibleConstructorReturn(this, (Routes.__proto__ || Object.getPrototypeOf(Routes)).apply(this, arguments));
  }

  _createClass(Routes, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          Comp = _props.component,
          render = _props.render,
          children = _props.children;


      var getFullComponentForPath = function getFullComponentForPath(path) {
        var Comp = getComponentForPath(path);
        var is404 = path === '404';
        if (!Comp) {
          is404 = true;
          Comp = getComponentForPath('404');
        }
        return function (newProps) {
          return Comp ? _react2.default.createElement(Comp, _extends({}, newProps, is404 ? { is404: true } : {})) : null;
        };
      };

      var renderProps = {
        componentsByTemplateID: global.componentsByTemplateID,
        templateIDsByPath: global.templateIDsByPath,
        getComponentForPath: getFullComponentForPath
      };

      if (Comp) {
        return _react2.default.createElement(Comp, renderProps);
      }

      if (render || children) {
        return (render || children)(renderProps);
      }

      // This is the default auto-routing renderer
      return _react2.default.createElement(_reactRouterDom.Route, { path: '*', render: function render(props) {
          var Comp = getFullComponentForPath(props.location.pathname);
          // If Comp is used as a component here, it triggers React to re-mount the entire
          // component tree underneath during reconciliation, losing all internal state.
          // By unwrapping it here we keep the real, static component exposed directly to React.
          return Comp && Comp(_extends({}, props, { key: props.location.pathname }));
        } });
    }
  }]);

  return Routes;
}(_react.Component);

exports.default = Routes;
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("babel-plugin-universal-import/importCss");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("babel-plugin-universal-import/universalImport");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("react-router-dom");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.setHasBabelPlugin = exports.ReportChunks = exports.MODULE_IDS = exports.CHUNK_NAMES = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requireUniversalModule = __webpack_require__(18);

Object.defineProperty(exports, 'CHUNK_NAMES', {
  enumerable: true,
  get: function get() {
    return _requireUniversalModule.CHUNK_NAMES;
  }
});
Object.defineProperty(exports, 'MODULE_IDS', {
  enumerable: true,
  get: function get() {
    return _requireUniversalModule.MODULE_IDS;
  }
});

var _reportChunks = __webpack_require__(19);

Object.defineProperty(exports, 'ReportChunks', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_reportChunks).default;
  }
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(4);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _hoistNonReactStatics = __webpack_require__(20);

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _requireUniversalModule2 = _interopRequireDefault(_requireUniversalModule);

var _utils = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var hasBabelPlugin = false;

var isHMR = function isHMR() {
  return (
    // $FlowIgnore
    module.hot && (module.hot.data || module.hot.status() === 'apply')
  );
};

var setHasBabelPlugin = exports.setHasBabelPlugin = function setHasBabelPlugin() {
  hasBabelPlugin = true;
};

function universal(component) {
  var _class, _temp;

  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _opts$loading = opts.loading,
      Loading = _opts$loading === undefined ? _utils.DefaultLoading : _opts$loading,
      _opts$error = opts.error,
      Err = _opts$error === undefined ? _utils.DefaultError : _opts$error,
      _opts$minDelay = opts.minDelay,
      minDelay = _opts$minDelay === undefined ? 0 : _opts$minDelay,
      _opts$alwaysDelay = opts.alwaysDelay,
      alwaysDelay = _opts$alwaysDelay === undefined ? false : _opts$alwaysDelay,
      _opts$testBabelPlugin = opts.testBabelPlugin,
      testBabelPlugin = _opts$testBabelPlugin === undefined ? false : _opts$testBabelPlugin,
      _opts$loadingTransiti = opts.loadingTransition,
      loadingTransition = _opts$loadingTransiti === undefined ? true : _opts$loadingTransiti,
      options = _objectWithoutProperties(opts, ['loading', 'error', 'minDelay', 'alwaysDelay', 'testBabelPlugin', 'loadingTransition']);

  var isDynamic = hasBabelPlugin || testBabelPlugin;
  options.isDynamic = isDynamic;
  options.modCache = {};
  options.promCache = {};

  return _temp = _class = function (_React$Component) {
    _inherits(UniversalComponent, _React$Component);

    _createClass(UniversalComponent, null, [{
      key: 'preload',

      /* eslint-enable react/sort-comp */

      /* eslint-disable react/sort-comp */
      value: function preload(props) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        props = props || {};

        var _req = (0, _requireUniversalModule2.default)(component, options, props),
            requireAsync = _req.requireAsync,
            requireSync = _req.requireSync;

        var Component = void 0;

        try {
          Component = requireSync(props, context);
        } catch (error) {
          return Promise.reject(error);
        }

        return Promise.resolve().then(function () {
          if (Component) return Component;
          return requireAsync(props, context);
        }).then(function (Component) {
          (0, _hoistNonReactStatics2.default)(UniversalComponent, Component, { preload: true });
          return Component;
        });
      }
    }]);

    function UniversalComponent(props, context) {
      _classCallCheck(this, UniversalComponent);

      var _this = _possibleConstructorReturn(this, (UniversalComponent.__proto__ || Object.getPrototypeOf(UniversalComponent)).call(this, props, context));

      _this.update = function (state) {
        var isMount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var isSync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var isServer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (!_this._mounted) return;
        if (!state.error) state.error = null;

        _this.handleAfter(state, isMount, isSync, isServer);
      };

      _this.state = { error: null };
      return _this;
    }

    _createClass(UniversalComponent, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        this._mounted = true;

        var _req2 = (0, _requireUniversalModule2.default)(component, options, this.props),
            addModule = _req2.addModule,
            requireSync = _req2.requireSync,
            requireAsync = _req2.requireAsync,
            asyncOnly = _req2.asyncOnly;

        var Component = void 0;

        try {
          Component = requireSync(this.props, this.context);
        } catch (error) {
          return this.update({ error: error });
        }

        this._asyncOnly = asyncOnly;
        var chunkName = addModule(this.props); // record the module for SSR flushing :)

        if (this.context.report) {
          this.context.report(chunkName);
        }

        if (Component || _utils.isServer) {
          this.handleBefore(true, true, _utils.isServer);
          this.update({ Component: Component }, true, true, _utils.isServer);
          return;
        }

        this.handleBefore(true, false);
        this.requireAsync(requireAsync, this.props, true);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        var _this2 = this;

        if (isDynamic || this._asyncOnly) {
          var _req3 = (0, _requireUniversalModule2.default)(component, options, nextProps, this.props),
              requireSync = _req3.requireSync,
              requireAsync = _req3.requireAsync,
              shouldUpdate = _req3.shouldUpdate;

          if (shouldUpdate(nextProps, this.props)) {
            var Component = void 0;

            try {
              Component = requireSync(nextProps, this.context);
            } catch (error) {
              return this.update({ error: error });
            }

            this.handleBefore(false, !!Component);

            if (!Component) {
              return this.requireAsync(requireAsync, nextProps);
            }

            var state = { Component: Component };

            if (alwaysDelay) {
              if (loadingTransition) this.update({ Component: null }); // display `loading` during componentWillReceiveProps
              setTimeout(function () {
                return _this2.update(state, false, true);
              }, minDelay);
              return;
            }

            this.update(state, false, true);
          } else if (isHMR()) {
            var _Component = requireSync(nextProps, this.context);
            this.setState({ Component: function Component() {
                return null;
              } }); // HMR /w Redux and HOCs can be finicky, so we
            setTimeout(function () {
              return _this2.setState({ Component: _Component });
            }); // toggle components to insure updates occur
          }
        }
      }
    }, {
      key: 'requireAsync',
      value: function requireAsync(_requireAsync, props, isMount) {
        var _this3 = this;

        if (this.state.Component && loadingTransition) {
          this.update({ Component: null }); // display `loading` during componentWillReceiveProps
        }

        var time = new Date();

        _requireAsync(props, this.context).then(function (Component) {
          var state = { Component: Component };

          var timeLapsed = new Date() - time;
          if (timeLapsed < minDelay) {
            var extraDelay = minDelay - timeLapsed;
            return setTimeout(function () {
              return _this3.update(state, isMount);
            }, extraDelay);
          }

          _this3.update(state, isMount);
        }).catch(function (error) {
          return _this3.update({ error: error });
        });
      }
    }, {
      key: 'handleBefore',
      value: function handleBefore(isMount, isSync) {
        var isServer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (this.props.onBefore) {
          var onBefore = this.props.onBefore;

          var info = { isMount: isMount, isSync: isSync, isServer: isServer };
          onBefore(info);
        }
      }
    }, {
      key: 'handleAfter',
      value: function handleAfter(state, isMount, isSync, isServer) {
        var Component = state.Component,
            error = state.error;


        if (Component && !error) {
          (0, _hoistNonReactStatics2.default)(UniversalComponent, Component, { preload: true });

          if (this.props.onAfter) {
            var onAfter = this.props.onAfter;

            var info = { isMount: isMount, isSync: isSync, isServer: isServer };
            onAfter(info, Component);
          }
        } else if (error && this.props.onError) {
          this.props.onError(error);
        }

        this.setState(state);
      }
    }, {
      key: 'render',
      value: function render() {
        var _state = this.state,
            error = _state.error,
            Component = _state.Component;

        var _props = this.props,
            isLoading = _props.isLoading,
            userError = _props.error,
            props = _objectWithoutProperties(_props, ['isLoading', 'error']);

        // user-provided props (e.g. for data-fetching loading):


        if (isLoading) {
          return (0, _utils.createElement)(Loading, props);
        } else if (userError) {
          return (0, _utils.createElement)(Err, _extends({}, props, { error: userError }));
        } else if (error) {
          return (0, _utils.createElement)(Err, _extends({}, props, { error: error }));
        } else if (Component) {
          // primary usage (for async import loading + errors):
          return (0, _utils.createElement)(Component, props);
        }

        return (0, _utils.createElement)(Loading, props);
      }
    }]);

    return UniversalComponent;
  }(_react2.default.Component), _class.contextTypes = {
    store: _propTypes2.default.object,
    report: _propTypes2.default.func
  }, _temp;
}
exports.default = universal;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearChunks = exports.flushModuleIds = exports.flushChunkNames = exports.MODULE_IDS = exports.CHUNK_NAMES = undefined;
exports.default = requireUniversalModule;

var _utils = __webpack_require__(5);

var CHUNK_NAMES = exports.CHUNK_NAMES = new Set();
var MODULE_IDS = exports.MODULE_IDS = new Set();

function requireUniversalModule(universalConfig, options, props, prevProps) {
  var key = options.key,
      _options$timeout = options.timeout,
      timeout = _options$timeout === undefined ? 15000 : _options$timeout,
      onLoad = options.onLoad,
      onError = options.onError,
      isDynamic = options.isDynamic,
      modCache = options.modCache,
      promCache = options.promCache;


  var config = getConfig(isDynamic, universalConfig, options, props);
  var chunkName = config.chunkName,
      path = config.path,
      resolve = config.resolve,
      load = config.load;

  var asyncOnly = !path && !resolve || typeof chunkName === 'function';

  var requireSync = function requireSync(props, context) {
    var exp = (0, _utils.loadFromCache)(chunkName, props, modCache);

    if (!exp) {
      var mod = void 0;

      if (!(0, _utils.isWebpack)() && path) {
        var modulePath = (0, _utils.callForString)(path, props) || '';
        mod = (0, _utils.tryRequire)(modulePath);
      } else if ((0, _utils.isWebpack)() && resolve) {
        var weakId = (0, _utils.callForString)(resolve, props);

        if (__webpack_require__.m[weakId]) {
          mod = (0, _utils.tryRequire)(weakId);
        }
      }

      if (mod) {
        exp = (0, _utils.resolveExport)(mod, key, onLoad, chunkName, props, context, modCache, true);
      }
    }

    return exp;
  };

  var requireAsync = function requireAsync(props, context) {
    var exp = (0, _utils.loadFromCache)(chunkName, props, modCache);
    if (exp) return Promise.resolve(exp);

    var cachedPromise = (0, _utils.loadFromPromiseCache)(chunkName, props, promCache);
    if (cachedPromise) return cachedPromise;

    var prom = new Promise(function (res, rej) {
      var reject = function reject(error) {
        error = error || new Error('timeout exceeded');
        clearTimeout(timer);
        if (onError) {
          var _isServer = typeof window === 'undefined';
          var info = { isServer: _isServer };
          onError(error, info);
        }
        rej(error);
      };

      // const timer = timeout && setTimeout(reject, timeout)
      var timer = timeout && setTimeout(reject, timeout);

      var resolve = function resolve(mod) {
        clearTimeout(timer);

        var exp = (0, _utils.resolveExport)(mod, key, onLoad, chunkName, props, context, modCache);
        if (exp) return res(exp);

        reject(new Error('export not found'));
      };

      var request = load(props, { resolve: resolve, reject: reject });

      // if load doesn't return a promise, it must call resolveImport
      // itself. Most common is the promise implementation below.
      if (!request || typeof request.then !== 'function') return;
      request.then(resolve).catch(reject);
    });

    (0, _utils.cacheProm)(prom, chunkName, props, promCache);
    return prom;
  };

  var addModule = function addModule(props) {
    if (_utils.isServer || _utils.isTest) {
      if (chunkName) {
        var name = (0, _utils.callForString)(chunkName, props);
        if (name) CHUNK_NAMES.add(name);
        if (!_utils.isTest) return name; // makes tests way smaller to run both kinds
      }

      if ((0, _utils.isWebpack)()) {
        var weakId = (0, _utils.callForString)(resolve, props);
        if (weakId) MODULE_IDS.add(weakId);
        return weakId;
      }

      if (!(0, _utils.isWebpack)()) {
        var modulePath = (0, _utils.callForString)(path, props);
        if (modulePath) MODULE_IDS.add(modulePath);
        return modulePath;
      }
    }
  };

  var shouldUpdate = function shouldUpdate(next, prev) {
    var cacheKey = (0, _utils.callForString)(chunkName, next);

    var config = getConfig(isDynamic, universalConfig, options, prev);
    var prevCacheKey = (0, _utils.callForString)(config.chunkName, prev);

    return cacheKey !== prevCacheKey;
  };

  return {
    requireSync: requireSync,
    requireAsync: requireAsync,
    addModule: addModule,
    shouldUpdate: shouldUpdate,
    asyncOnly: asyncOnly
  };
}

var flushChunkNames = exports.flushChunkNames = function flushChunkNames() {
  var chunks = Array.from(CHUNK_NAMES);
  CHUNK_NAMES.clear();
  return chunks;
};

var flushModuleIds = exports.flushModuleIds = function flushModuleIds() {
  var ids = Array.from(MODULE_IDS);
  MODULE_IDS.clear();
  return ids;
};

var clearChunks = exports.clearChunks = function clearChunks() {
  CHUNK_NAMES.clear();
  MODULE_IDS.clear();
};

var getConfig = function getConfig(isDynamic, universalConfig, options, props) {
  if (isDynamic) {
    return typeof universalConfig === 'function' ? universalConfig(props) : universalConfig;
  }

  var load = typeof universalConfig === 'function' ? universalConfig : // $FlowIssue
  function () {
    return universalConfig;
  };

  return {
    file: 'default',
    id: options.id || 'default',
    chunkName: options.chunkName || 'default',
    resolve: options.resolve || '',
    path: options.path || '',
    load: load
  };
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(4);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReportChunks = function (_React$Component) {
  _inherits(ReportChunks, _React$Component);

  function ReportChunks() {
    _classCallCheck(this, ReportChunks);

    return _possibleConstructorReturn(this, (ReportChunks.__proto__ || Object.getPrototypeOf(ReportChunks)).apply(this, arguments));
  }

  _createClass(ReportChunks, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        report: this.props.report
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.Children.only(this.props.children);
    }
  }]);

  return ReportChunks;
}(_react2.default.Component);

ReportChunks.propTypes = {
  report: _propTypes2.default.func.isRequired
};
ReportChunks.childContextTypes = {
  report: _propTypes2.default.func.isRequired
};
exports.default = ReportChunks;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("hoist-non-react-statics");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  name: 'Faa.st',
  author: 'Bitaccess',
  description: 'Faast is the safest and fastest way to build a crypto currency portfolio. Connect your hardware wallet, metamask, or other ethereum wallet and let us do the work for you. Easily trade over 100 different tokens for near-zero fees.',
  year: new Date().getFullYear()
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var EmailSubscriptionForm = function EmailSubscriptionForm() {
    return React.createElement(
        'section',
        { className: 'container-fluid signup-wrapper' },
        React.createElement('iframe', { src: 'https://app.mailjet.com/widget/iframe/3lll/8M5', width: '100%', height: '260px', frameBorder: 0, scrolling: 'no', marginHeight: 0, marginWidth: 0 })
    );
};
exports.default = EmailSubscriptionForm;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(4);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _recompose = __webpack_require__(1);

var _classNames = __webpack_require__(24);

var _classNames2 = _interopRequireDefault(_classNames);

var _style = __webpack_require__(25);

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _recompose.compose)((0, _recompose.setDisplayName)('IconCarousel'), (0, _recompose.setPropTypes)({
  items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
    key: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
    label: _propTypes2.default.node.isRequired,
    iconUrl: _propTypes2.default.string.isRequired,
    link: _propTypes2.default.string.isRequired
  })).isRequired
}), (0, _recompose.withProps)({
  refs: {
    wrapper: _react2.default.createRef(),
    carousel: _react2.default.createRef(),
    leftArrow: _react2.default.createRef(),
    rightArrow: _react2.default.createRef(),
    firstIcon: _react2.default.createRef()
  }
}), (0, _recompose.withState)('shiftAmount', 'setShiftAmount', 0), (0, _recompose.withHandlers)(function (_ref) {
  var refs = _ref.refs,
      setShiftAmount = _ref.setShiftAmount;

  var getWidth = function getWidth(elem) {
    return elem && elem.getBoundingClientRect().width || 0;
  };

  function shiftIcons(shiftAmount, right) {
    var carouselWidth = getWidth(refs.carousel.current);
    var wrapperWidth = getWidth(refs.wrapper.current);
    var leftArrowWidth = getWidth(refs.leftArrow.current);
    var rightArrowWidth = getWidth(refs.rightArrow.current);
    var iconWidth = getWidth(refs.firstIcon.current);
    var viewPort = wrapperWidth - leftArrowWidth - rightArrowWidth;
    var minShift = 0;
    var maxShift = carouselWidth - viewPort;
    var increment = viewPort - viewPort % iconWidth; // Round down to multiple of icon width
    var newShift = right ? Math.min(maxShift, shiftAmount + increment) : Math.max(minShift, shiftAmount - increment);
    setShiftAmount(newShift);
  }

  return {
    handleClickRight: function handleClickRight(_ref2) {
      var shiftAmount = _ref2.shiftAmount;
      return function () {
        return shiftIcons(shiftAmount, true);
      };
    },
    handleClickLeft: function handleClickLeft(_ref3) {
      var shiftAmount = _ref3.shiftAmount;
      return function () {
        return shiftIcons(shiftAmount, false);
      };
    }
  };
}))(function (_ref4) {
  var items = _ref4.items,
      refs = _ref4.refs,
      shiftAmount = _ref4.shiftAmount,
      handleClickLeft = _ref4.handleClickLeft,
      handleClickRight = _ref4.handleClickRight;
  return _react2.default.createElement(
    'div',
    { className: _style2.default.wrapper, ref: refs.wrapper },
    _react2.default.createElement(
      'div',
      { className: (0, _classNames2.default)(_style2.default.arrow, _style2.default.arrowLeft), ref: refs.leftArrow, onClick: handleClickLeft },
      _react2.default.createElement('h2', { className: 'fa fa-caret-left' })
    ),
    _react2.default.createElement(
      'div',
      { className: (0, _classNames2.default)(_style2.default.arrow, _style2.default.arrowRight), ref: refs.rightArrow, onClick: handleClickRight },
      _react2.default.createElement('h2', { className: 'fa fa-caret-right' })
    ),
    _react2.default.createElement(
      'div',
      { className: _style2.default.carousel, ref: refs.carousel, style: { transform: 'translate3d(-' + shiftAmount + 'px, 0, 0)' } },
      items.map(function (_ref5, i) {
        var key = _ref5.key,
            label = _ref5.label,
            iconUrl = _ref5.iconUrl,
            link = _ref5.link;
        return _react2.default.createElement(
          'div',
          _extends({ key: key, className: _style2.default.icon }, i === 0 ? { ref: refs.firstIcon } : {}),
          _react2.default.createElement(
            'a',
            { className: 'd-block text-white', href: link },
            _react2.default.createElement('img', { className: _style2.default.iconImg, src: iconUrl }),
            _react2.default.createElement(
              'div',
              { className: _style2.default.iconLabel },
              label
            )
          )
        );
      })
    )
  );
});

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("class-names");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {"wrapper":"_1rBjt-TmWiFR","carousel":"_5Mve6tZCwVoD","arrow":"_34KECEovMfOa","arrowLeft":"_1ae07izudiY-","arrowRight":"_2SMI_OZXgEpd","icon":"_2i0isA6EuMFE","iconImg":"_2T0K8gt1fclD","iconLabel":"_25c0Bgv9-xEA"};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/trezor.79356ffc.png";

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/ledger.9901cd86.png";

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/mist.afce935f.png";

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/metamask.023762b6.png";

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/status.e3bf9bf3.png";

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/coinbase.748629a3.png";

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/trust.c9743217.png";

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/mew.de0d79c1.svg";

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/secure.bf5abee9.svg";

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/simple.19592fe0.svg";

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/privacy.fa9caeec.svg";

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/add-wallet.5fc4e115.svg";

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/view-dashboard.90765570.svg";

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/swap-funds.58a96b4a.svg";

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/moon-background.b451e31a.jpg";

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/macbook-screenshot-01.27f2f8a0.png";

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/macbook-screenshot-02.6cd06b59.png";

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/bitaccess.a42f3ea4.svg";

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "static/img/faast-logo-64x64.4f4a2fc0.png";

/***/ }),
/* 45 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {"themeColor_primary":"#05B8AB","themeColor_secondary":"#05C76A","themeColor_success":"#05C76A","themeColor_info":"#17a2b8","themeColor_warning":"#FACC2E","themeColor_danger":"#BC1515","themeColor_light":"#f5f5f5","themeColor_grey":"#9e9e9e","themeColor_dark":"#303030","themeColor_ultra-dark":"#212121","themeColor_dark-navbar":"#212121","themeColor_positive":"#05C76A","themeColor_negative":"#BC1515","themeColor_white":"#fff","breakpoint_xxs":"0","breakpoint_xs":"432px","breakpoint_sm":"576px","breakpoint_md":"768px","breakpoint_lg":"984px","breakpoint_xl":"1200px","zIndex_dropdown":"1000","zIndex_overlay":"1010","zIndex_sticky":"1020","zIndex_fixed":"1040","zIndex_modal":"1050","zIndex_popover":"1060","zIndex_tooltip":"1070","borderRadius":"2px","borderWidth":"1px","textColor":"rgba(255, 255, 255, 0.9)","textMutedColor":"rgba(255, 255, 255, 0.7)","textDisabledColor":"rgba(255, 255, 255, 0.5)","fontFamilyBase":"\"Open Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"","navbarHeight":"4rem"};

/***/ }),
/* 46 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=static.9b68960b.js.map