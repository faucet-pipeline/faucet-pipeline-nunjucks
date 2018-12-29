"use strict";
let path = require("path");

module.exports = {
	nunjucks: [{
		source: "./src/index.njk",
		target: "./dist/index.html"
	}],

	sass: [{
		source: "./src/app.scss",
		target: "./dist/app.css"
	}],

	manifest: {
		webRoot: "./dist"
	},

	plugins: {
		"nunjucks": {
			plugin: path.resolve("../.."),
			bucket: "static"
		}
	}
};
