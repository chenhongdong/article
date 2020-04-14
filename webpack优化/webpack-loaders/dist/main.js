/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./loaders/css-loader.js!./loaders/less-loader.js!./src/style.less":
/*!*************************************************************************!*\
  !*** ./loaders/css-loader.js!./loaders/less-loader.js!./src/style.less ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let list = []\r\nlist.push(\"body {\\n  background-color: #00a1f4;\\n  background-image: \")\r\nlist.push('url(' + __webpack_require__(/*! ./2.png */ \"./src/2.png\")+ ')')\r\nlist.push(\";\\n}\\n\")\r\nmodule.exports = list.join('')\n\n//# sourceURL=webpack:///./src/style.less?./loaders/css-loader.js!./loaders/less-loader.js");

/***/ }),

/***/ "./src/1.jpg":
/*!*******************!*\
  !*** ./src/1.jpg ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"54f1fd12be6eaf8f7cbc7b876d0ec037.jpg\"\n\n//# sourceURL=webpack:///./src/1.jpg?");

/***/ }),

/***/ "./src/2.png":
/*!*******************!*\
  !*** ./src/2.png ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"31b8fe96d48d3a8935fa0671c202adf2.png\"\n\n//# sourceURL=webpack:///./src/2.png?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _ = _interopRequireDefault(__webpack_require__(/*! ./1.jpg */ \"./src/1.jpg\"));\n\n__webpack_require__(/*! ./style.less */ \"./src/style.less\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Home = function Home(address) {\n  _classCallCheck(this, Home);\n\n  this.address = address;\n};\n\nvar home = new Home('北京');\nconsole.log(home.address); // !号的意思是导到前面去\n// -!不会让文件再去通过pre+normal的loader去处理了\n// ! 禁用普通的loader\n// !! 什么都不要\n// let a = require('!inline-loader!./a.js');\n\nvar img = document.createElement('img');\nimg.src = _[\"default\"];\ndocument.body.appendChild(img);\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/style.less":
/*!************************!*\
  !*** ./src/style.less ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\n        let style = document.createElement('style');\n        style.innerHTML = __webpack_require__(/*! !../loaders/css-loader.js!../loaders/less-loader.js!./style.less */ \"./loaders/css-loader.js!./loaders/less-loader.js!./src/style.less\");\n        document.head.appendChild(style);\n    \n\n//# sourceURL=webpack:///./src/style.less?");

/***/ })

/******/ });