// const iPhone = puppeteer.devices['iPhone 6']
const puppeteer = require('puppeteer')

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
	default:
		console.log('Wrong argument!')
}

// ;(async () => {

// 	//await page.screenshot({ path: 'iphone.png' })
// 	//await page.pdf({ path: 'dev.pdf', format: 'A4' })

// 	const [response] = await Promise.all([
// 		page.waitForNavigation(),
// 		page.click('.single-article.big-article a')
// 	])

// })()
