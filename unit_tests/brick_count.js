const puppeteer = require('puppeteer');
const fs = require('fs');
const Printer = require('./util.js').Printer;
var ArgumentParser = require('argparse').ArgumentParser;


var parser = new ArgumentParser({ addHelp: true, headless: false });

parser.addArgument('--width', { defaultValue: 1200, type: 'int' });
parser.addArgument('--height', { defaultValue: 900, type: 'int' });
parser.addArgument('--withhead', { dest: 'headless', action: 'storeFalse' });
var args = parser.parseArgs();
console.log(args);

const width = args.width;
const height = args.height;
const headless = args.headless
const outdir = __dirname + '/output/brick_count/';
const printer = new Printer(outdir, headless);

(async () => {

	const browser = await puppeteer.launch({
		headless: headless,
		defaultViewport: {
			width: width,
			height: height,
		}
	});
	console.log(await browser.version());

	const page = await browser.newPage();

	await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle2' });
	await page.waitFor(100)
	await printer.writeText('browser.version: ' + await browser.version() + ' width:' + width + ' height:' + height)
	await printer.writeImg(page, 'Load home')

	await page.click('#start')
	await page.waitFor(100)
	await printer.writeImg(page, 'Go to Game')

	await page.click('#pause')
	await page.click('#exit')
	await page.click('#gotoSetting')
	await page.waitFor(100)
	await printer.writeImg(page, 'Click Pause. Click Exit. Go back to Home. Go to Setting')

	await page.click('#increaseBrickCount')
	await page.waitFor(100)
	await printer.writeImg(page, 'Increase brick count +1')

	await page.click('#gohome')
	await page.click('#start')
	await page.waitFor(100)
	await printer.writeImg(page, 'Go back to Home. Go to Game')

	await page.click('#pause')
	await page.click('#exit')
	await page.click('#gotoSetting')
	await printer.writeImg(page, 'Click Pause. Click Exit. Go back to Home. Go to Setting')

	await page.click('#decreaseBrickCount')
	await page.click('#decreaseBrickCount')
	await page.waitFor(100)
	await printer.writeImg(page, 'Decrease brick count -2')

	await page.click('#gohome')
	await page.click('#start')
	await page.waitFor(100)
	await printer.writeImg(page, 'Go back to Home. Go to Game')

	await page.click('#pause')
	await page.click('#exit')
	await page.click('#gotoSetting')
	await page.waitFor(100)
	await printer.writeImg(page, 'Click Pause. Click Exit. Go back to Home. Go to Setting')

	await page.click('#increaseBrickCount')
	await page.click('#increaseBrickCount')
	await page.click('#increaseBrickCount')
	await page.waitFor(100)
	await printer.writeImg(page, 'Increase brick count +3')

	await page.click('#gohome')
	await page.click('#start')
	await page.waitFor(100)
	await printer.writeImg(page, 'Go back to Home. Go to Game')

	await browser.close();
})();
