const path = require('path');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');
const ElectronPDF = require('electron-pdf');
const normalize = require('./normalize');
const fs = require('fs');
const config = require('../config.json');

const exporter = new ElectronPDF();

const jobOptions = {
	inMemory: false
};

function getTempPath() {
	return path.resolve(`${Date.now()}.pdf`);
}

const app = new Koa();

app.use(koaBody());
app.use(new Router().post(config.url, async ctx => {
	const body = ctx.request.body;
	const source = normalize.source(body.source);
	const options = normalize.options(body.options);
	const job = await exporter.createJob(source, getTempPath(), options, jobOptions);
	
	const resultPath = await new Promise((resolve, reject) => {
		job.on('job-complete', r => resolve(r.results[0]));

		job.render();
	});

	const result = fs.createReadStream(resultPath);

	result.on('close', () => fs.unlink(resultPath));

	ctx.body = result;
}).routes());

exporter.on('charged', () => {
	app.listen(config.port, config.hostname, function() {
		console.log(`Export Server running at http://${config.hostname}:${config.port}`);
	});
});

exporter.start();