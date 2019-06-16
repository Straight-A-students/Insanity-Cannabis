const fs = require('fs');

class Printer {
	constructor(outdir, screenshot) {
		this.outdir = outdir;
		this.screenshot = screenshot;
		this.imgCount = 0;
		this.htmlfile = outdir + 'result.html'

		if (!this.screenshot) {
			return;
		}

		if (!fs.existsSync(outdir)) {
			fs.mkdirSync(outdir, { recursive: true });
		}

		if (fs.existsSync(this.htmlfile)) {
			fs.unlink(this.htmlfile, function(err) {
				if (err) throw err;
			});
		}
	}

	writeText(text = '') {
		if (!this.screenshot) {
			return;
		}

		fs.appendFileSync(this.htmlfile, text + '<br>\n', function(err) {
			if (err) throw err;
		})
	}

	async writeImg(page, text = '') {
		if (!this.screenshot) {
			return;
		}

		this.imgCount++;
		let filename = this.imgCount + '.png';

		console.log('writeImg ' + filename + ' ' + text)
		this.writeText(text)
		this.writeText('<img src="' + filename + '" width="50%">')
		if (this.screenshot) {
			return page.screenshot({
				path: this.outdir + filename
			});
		} else {
			return new Promise((resolve) => { resolve(); });
		}
	}
}

module.exports = {
	'Printer': Printer
}
