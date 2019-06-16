/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const fs = require('fs');
const Printer = require('./util.js').Printer;
var ArgumentParser = require('argparse').ArgumentParser;


var parser = new ArgumentParser({ addHelp: true, headless: false });

parser.addArgument('--withhead', { dest: 'headless', action: 'storeFalse' });
var args = parser.parseArgs();
console.log(args);

const headless = args.headless;
const outdir = __dirname + '/output/ach_zero_pass/';
const printer = new Printer(outdir, headless);

(async () => {

	const browser = await puppeteer.launch({
		headless: headless,
		defaultViewport: {
			width: 1120,
			height: 630,
		}
	});
	console.log(await browser.version());

	const page = await browser.newPage();

	await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle2' });
	await page.waitFor(100);
	await printer.writeText('browser.version: ' + await browser.version());
	await printer.writeImg(page, 'Load home');

	await page.click('#gotoSetting');
	await page.waitFor(100);
	await printer.writeImg(page, 'Go to setting');

	await page.click('#decreaseBrickCount');
	await page.click('#decreaseBrickCount');
	await page.waitFor(100);
	await printer.writeImg(page, 'Decrease brick count -2');

	await page.click('#gohome');
	await printer.writeImg(page, 'Go to home');

	await page.click('#start');
	await page.waitFor(100);
	await printer.writeImg(page, 'Go to game');

	let tryCount = 0;

	while (true) { // eslint-disable-line no-constant-condition
		tryCount++;
		console.log('Game start', tryCount);

		let isResolve = await page.evaluate(() => app.game.isResolve());

		if (isResolve) {
			break;
		}

		console.log('Restart game');
		await page.click('#pause');
		await page.waitFor(100);
		await page.click('#exit');
		await page.waitFor(100);
		await page.click('#start');
		await page.waitFor(100);
	}

	await page.click('#submit');
	await page.waitFor(1500);

	await page.click('#resultPage_home');
	await page.waitFor(100);

	await page.click('#gotoAchievement');
	await page.waitFor(100);

	let preTop = -1;
	while (true) { // eslint-disable-line no-constant-condition
		await page.evaluate(() => {
			document.querySelector('#achievement').scrollBy(0, 10);
		});
		await page.waitFor(100);
		let nowTop = await page.evaluate(() => document.querySelector('#achievement').scrollTop);
		if (preTop == nowTop) {
			break;
		}
		preTop = nowTop;
	}
	await page.waitFor(3000);

	await page.click('#gohome');
	await printer.writeImg(page, 'Go to home');
	await page.waitFor(100);

	await page.click('#gotoSetting');
	await page.waitFor(100);

	for (let i = 0; i < 15; i++) {
		await page.mouse.move(200, 400);
		await page.mouse.down();
		await page.mouse.move(200, 380);
		await page.mouse.up();
		await page.waitFor(500);
	}

	let remainNotice = 1;
	while (remainNotice > 0) {
		remainNotice = await page.evaluate(() => app.noticeStack.length);
		await page.waitFor(1000);
	}

	await page.waitFor(3000);
	await browser.close();
})();
