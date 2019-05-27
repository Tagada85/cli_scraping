const puppeteer = require('puppeteer')

const getQueryResults = async query => {
	console.log(`Query results:\n -------------------`)
	try {
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.goto(`https://dev.to/search?q=${query.join('%20')}`)
		await page.waitForSelector('.single-article')

		const articles = await page.$$('.single-article')

		for (let i = 0; i < articles.length; i++) {
			let title = await articles[i].$eval('h3', t => t.textContent)
			let author = await articles[i].$eval(
				'h4',
				a => a.textContent.split('・')[0]
			)
			let tag = ''
			let numberOfReactions = 0
			let numberOfComments = 0
			if (title.startsWith('#')) {
				tag = await articles[i].$eval('span.tag-identifier', s => s.textContent)
			}
			title = title.substring(tag.length)

			let likes = await articles[i].$('.reactions-count')
			let comments = await articles[i].$('.comments-count')
			if (likes) {
				numberOfReactions = await likes.$eval(
					'.engagement-count-number',
					span => span.innerHTML
				)
			}

			if (comments) {
				numberOfComments = await comments.$eval(
					'.engagement-count-number',
					span => span.innerHTML
				)
			}

			console.log(
				`${i +
					1}) ${title} by ${author} has ${numberOfReactions} reactions and ${numberOfComments} comments.`
			)
		}

		await browser.close()
	} catch (e) {
		console.log(e)
	}
}

const getScreenshotDevice = async device => {
	try {
		const d = puppeteer.devices[device]
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.emulate(d)
		await page.goto('https://dev.to')
		await page.screenshot({
			path: `screenshots-devices/${device}.png`,
			fullPage: true
		})
		await browser.close()
	} catch (e) {
		console.log(e)
	}
}

const getScreenshot = async username => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(`https://dev.to/${username}`)
	await page.screenshot({
		path: `screenshots-users/${username}.png`,
		fullPage: true
	})
	await browser.close()
}

const getPDF = async username => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(`https://dev.to/${username}`)

	await Promise.all([page.waitForNavigation(), page.click('.single-article')])
	const dataPath = await page.evaluate(() =>
		document.querySelector('.article').getAttribute('data-path')
	)
	await page.pdf({ path: `pdfs/${dataPath.split('/')[2]}.pdf` })

	await browser.close()
}

switch (process.argv[2]) {
	case 'getScreen':
		getScreenshot(process.argv[3])
		break
	case 'getPDF':
		getPDF(process.argv[3])
		break
	case 'getScreenDevice':
		getScreenshotDevice(process.argv[3])
		break
	case 'query':
		getQueryResults(process.argv.slice(3))
		break
	default:
		console.log('Wrong argument!')
}
