// puppeteer安装总失败，因为在安装的时候会给顺便安一个最新版本的Chrominum
// 由于这个是Google出的，所以你懂得...
// 于是乎，他们又出了一个不带Chrominum的版本，直接是核心包叫puppeteer-core
// npm i puppeteer-core
const puppeteer = require('puppeteer');
const url = 'https://juejin.im/tag/%E5%89%8D%E7%AB%AF';

(async function () {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle2'   // 直到network不再请求资源
    });
    // 获取指定节点的属性
    // 一个$ 表示取一个节点   两个$ 表示取多个节点
    const titles = await page.$$eval('a.title', elements => {
        return elements.map(item => item.innerHTML);
    });
    console.log('title', titles);

    browser.close();
})();