function source(origin) {
	return origin.map(item => (new URL(item)).href);
}

const defaultOptions = {
	marginsType: 0,
	printBackground: true,
	printSelectionOnly: false,
	landscape: false,
	pageSize: 'A4'
}

function options(origin = {}) {
	const temp = origin

	return temp;
}

module.exports = {
	source,
	options
};