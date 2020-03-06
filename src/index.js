const path = require('path');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');
const ElectronPDF = require('electron-pdf');
const normalize = require('./normalize');

const exporter = new ElectronPDF();

const config = {
	hostname: 'localhost',
	port: 2333,
	target: path.resolve('pdf', `${Date.now()}.pdf`),
	jobOptions: {
		inMemory: true
	}
};

const app = new Koa();

app.use(koaBody());
app.use(new Router({prefix: '/api'}).post('/pdf', async ctx => {
	const body = ctx.request.body;console.log(ctx, ctx.request, ctx.request.body);
	const source = normalize.source(body.source);
	const options = normalize.options(body.options);
	const job = await exporter.createJob(source, config.target, options, config.jobOptions);
	
	const result = new Promise((resolve, reject) => {
		job.on('job-complete', (r) => {
			console.log(r.results);
			resolve(r.results[0]);
		});

		job.render();
	});

	ctx.body = await result;
}).routes());

exporter.on('charged', () => {
	app.listen(config.port, config.hostname, function() {
		console.log(`Export Server running at http://${config.hostname}:${config.port}`);
	});
});

exporter.start();