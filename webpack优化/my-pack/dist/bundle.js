(function (modules) { // webpackBootstrap
	var installedModules = {};

	function __webpack_require__(moduleId) {

		if (installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}
		
		var module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
		};

		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		module.l = true;

		return module.exports;
	}

	return __webpack_require__(__webpack_require__.s = "./src/index.js");
})

({
    
        "./src/index.js": (function (module, exports, __webpack_require__) {
			eval(`__webpack_require__("./src/style.less");

const a = __webpack_require__("./src/a.js");

console.log(a);`);
		}),
    
        "./src/style.less": (function (module, exports, __webpack_require__) {
			eval(`let style = document.createElement('style');
style.innerHTML = "body {\\n  background-color: #0cc;\\n}\\n";
document.head.appendChild(style);`);
		}),
    
        "./src/a.js": (function (module, exports, __webpack_require__) {
			eval(`const b = __webpack_require__("./src/base/b.js");

module.exports = 'a' + b;`);
		}),
    
        "./src/base/b.js": (function (module, exports, __webpack_require__) {
			eval(`module.exports = 'bbb';`);
		}),
    
});