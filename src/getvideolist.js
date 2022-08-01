import puppeteer from 'puppeteer';
import chalk from 'chalk';

async function GetVideoList(channelUrl) {

    if(!channelUrl.endsWith('/videos')) {
        channelUrl += '/videos';
    }

    console.log(chalk.cyan('Getting video list...'));
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(channelUrl);
    await page.waitForSelector('#items');
    await page.evaluate(() => {
        const timer = setInterval(() => {
            window.scrollTo(0, document.querySelector('.ytd-page-manager').scrollHeight);

        }, 100);

        setTimeout(() => {
            clearInterval(timer);
        }, 4999);

    }).catch(err => {
        console.log(err);
    });
    await page.waitForTimeout(5000);
    const videoList = await page.evaluate(() => {
        const videos = [];
        const anchors = document.querySelectorAll('a');
        anchors.forEach(anchor => {
            if(anchor.href.includes('/watch') || anchor.href.includes('/shorts')) {
                videos.push(anchor.href);
            }
        });
        return videos;

    }).catch(err => {
        console.log(err);
    });

    await browser.close();
    // remove duplicates
    const uniqueVideoList = videoList.filter((item, index) => videoList.indexOf(item) === index);
    console.log(chalk.blue(`Found ${uniqueVideoList.length} videos.`));
    return uniqueVideoList;

}

export default GetVideoList;