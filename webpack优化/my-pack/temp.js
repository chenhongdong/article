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
	"./src/a.js": (function (module, exports, __webpack_require__) {
			eval("const b = __webpack_require__(/*! ./base/b.js */ \"./src/base/b.js\");\n\nmodule.exports = 'a' + b;\n\n//# sourceURL=webpack:///./src/a.js?");
		}),

	"./src/base/b.js": (function (module, exports) {
			eval("module.exports = 'bbb';\n\n//# sourceURL=webpack:///./src/base/b.js?");
		}),

	"./src/index.js": (function (module, exports, __webpack_require__) {
			eval("const a = __webpack_require__(/*! ./a.js */ \"./src/a.js\");\n\nconsole.log(a);\n\n//# sourceURL=webpack:///./src/index.js?");
		})
});