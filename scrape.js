const puppeteer = require("puppeteer");

async function scrapeUrl(url) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    return await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector("h1")?.innerText.trim() ?? "",
      paragraphs: [...document.querySelectorAll("p")]
        .map(paragraph => paragraph.innerText.trim())
        .filter(Boolean),
      links: [...document.querySelectorAll("a")]
        .map(link => ({
          text: link.innerText.trim(),
          url: link.href
        }))
        .filter(link => link.text || link.url)
    }));
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeUrl };