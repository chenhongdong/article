function throttle(fn, timeout) {
	let timer;
	return function() {
		let self = this,
			args = arguments;

		clearTimeout(timer);

		timer = setTimeout(function() {
			fn.apply(self, args);
		}, timeout);
	};
};

export default throttle;