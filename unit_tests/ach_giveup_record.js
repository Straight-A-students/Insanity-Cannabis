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
const outdir = __dirname + '/output/ach_giveup_record/';
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

	await page.click('#start');
	await page.waitFor(100);
	await printer.writeImg(page, 'Go to game');

	const positionX = 520;
	const positionY = [190, 290, 370, 430];
	const waitRotate = 5;

	console.log('Game start');

	let answer = await page.evaluate(() => app.game.getAnswer());

	for (let playCount = 1; playCount <= 20; playCount++) {
		console.log('Game start', playCount);

		await page.mouse.move(positionX, positionY[0]);
		await page.mouse.down();
		for (let y = positionY[0]; y <= positionY[0] + 70; y += 10) {
			await page.mouse.move(positionX, y);
			await page.waitFor(waitRotate);
		}
		await page.mouse.up();
		await page.waitFor(100);

		console.log('Giveup');

		await page.click('#pause');
		await page.waitFor(100);

		if ([1, 10, 15, 20].includes(playCount)) {
			// Go to achievement

			await page.click('#exit');
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

			await page.click('#start');
			await page.waitFor(100);
			await printer.writeImg(page, 'Go to game');

		} else {
			// Restart game

			await page.click('#restart');
			await page.waitFor(100);
		}
	}

	console.log('Game end');

	let remainNotice = 1;
	while (remainNotice > 0) {
		remainNotice = await page.evaluate(() => app.noticeStack.length);
		await page.waitFor(1000);
	}

	await page.waitFor(3000);
	await browser.close();
})();
