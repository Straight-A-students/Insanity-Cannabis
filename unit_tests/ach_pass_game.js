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
const outdir = __dirname + '/output/ach_pass_game/';
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
	const positionZ = 600;
	const positionY = [190, 290, 370, 430];
	const waitRotate = 5;

	for (let playCount = 1; playCount <= 25; playCount++) {
		console.log('Game start', playCount);

		let answer = await page.evaluate(() => app.game.getAnswer());

		while (answer.length > 0) {
			const step = answer[0];

			await page.waitFor(500);

			switch (step[1]) {
				case 'X':
					await page.mouse.move(positionX, positionY[step[0]]);
					await page.mouse.down();
					if (step[2] == 3) {
						for (let y = positionY[step[0]]; y <= positionY[step[0]] + 70; y += 10) {
							await page.mouse.move(positionX, y);
							await page.waitFor(waitRotate);
						}
					} else {
						for (let y = positionY[step[0]]; y >= positionY[step[0]] - 70 * step[2]; y -= 10) {
							await page.mouse.move(positionX, y);
							await page.waitFor(waitRotate);
						}
					}
					await page.mouse.up();
					break;

				case 'Z':
					await page.mouse.move(positionZ, positionY[step[0]]);
					await page.mouse.down();
					if (step[2] == 3) {
						for (let y = positionY[step[0]]; y <= positionY[step[0]] + 70; y += 10) {
							await page.mouse.move(positionZ, y);
							await page.waitFor(waitRotate);
						}
					} else {
						for (let y = positionY[step[0]]; y >= positionY[step[0]] - 70 * step[2]; y -= 10) {
							await page.mouse.move(positionZ, y);
							await page.waitFor(waitRotate);
						}
					}
					await page.mouse.up();
					break;

				case 'Y':
					await page.mouse.move(positionX, positionY[step[0]]);
					await page.mouse.down();
					if (step[2] == 3) {
						for (let x = positionX; x >= positionX - 70; x -= 10) {
							await page.mouse.move(x, positionY[step[0]]);
							await page.waitFor(waitRotate);
						}
					} else {
						for (let x = positionX; x <= positionX + 70 * step[2]; x += 10) {
							await page.mouse.move(x, positionY[step[0]]);
							await page.waitFor(waitRotate);
						}
					}
					await page.mouse.up();
			}

			answer = await page.evaluate(() => app.game.getAnswer());
		}

		console.log('Game end');
		await page.click('#submit');
		await page.waitFor(1500);

		if ([3, 10, 15, 20, 25].includes(playCount)) {
			// Go to achievement

			await page.click('#resultPage_home');
			await page.waitFor(100);

			await page.click('#gotoAchievement');
			await page.waitFor(3000);

			await page.click('#gohome');
			await printer.writeImg(page, 'Go to home');
			await page.waitFor(100);

			await page.click('#start');
			await page.waitFor(100);
			await printer.writeImg(page, 'Go to game');

		} else {
			// Next game

			await page.click('#resultPage_next');
			await page.waitFor(200);
		}
	}

	let remainNotice = 1;
	while (remainNotice > 0) {
		remainNotice = await page.evaluate(() => app.noticeStack.length);
		await page.waitFor(1000);
	}

	await page.waitFor(3000);
	await browser.close();
})();
