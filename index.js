let nunjucks = require("nunjucks");
let nunjucksMarkdown = require("nunjucks-markdown");
let { loadExtension } = require("faucet-pipeline-core/lib/util");

module.exports = {
	key: "nunjucks",
	bucket: "static",
	plugin: faucetNunjucks
};

function faucetNunjucks(config, assetManager) {
	let render = buildRender(assetManager);
	let bundlers = config.map(bundleConfig =>
		makeBundler(bundleConfig, assetManager, render));

	return filepaths => Promise.all(bundlers.map(bundle => bundle(filepaths)));
}

function makeBundler(config, assetManager, render) {
	let source = assetManager.resolvePath(config.source);
	let target = assetManager.resolvePath(config.target, { enforceRelative: true });

	return filepaths => {
		if(!filepaths || filepaths.includes(source)) {
			render(source, config.markdown).
				then(res => assetManager.writeFile(target, res, {
					fingerprint: false
				})).
				catch(error => assetManager.writeFile(target, errorOutput(error), {
					error,
					fingerprint: false
				}));
		}
	};
}

function buildRender(assetManager) {
	let loader = new nunjucks.FileSystemLoader(".", { noCache: true });
	let env = new nunjucks.Environment(loader);
	env.addFilter("assetURL", identifier => assetManager.manifest.get(identifier));
	return (source, markdown) => {
		if(markdown) {
			let marked = loadExtension("marked", "failed to load markdown library");
			marked.setOptions({
				headerIds: false
			});
			nunjucksMarkdown.register(env, s => marked.parse(s));
		} else if(env.hasExtension("markdown")) {
			env.removeExtension("markdown");
		}
		return new Promise((resolve, reject) => {
			env.render(source, (error, res) => {
				if(error) {
					return reject(error);
				}

				resolve(res);
			});
		});
	};
}

function errorOutput(error) {
	return `An Error Occurred: ${error}`;
}
