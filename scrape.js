const puppeteer = require("puppeteer");

async function scrapeUrl(url) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    let stableBottomPasses = 0;
    let previousHeight = 0;
    for (let pass = 0; pass < 60 && stableBottomPasses < 2; pass++) {
      const state = await page.evaluate(() => {
        window.scrollBy(0, Math.max(window.innerHeight * 0.8, 500));
        return {
          atBottom: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight,
          height: document.documentElement.scrollHeight
        };
      });

      if (state.atBottom && state.height === previousHeight) {
        stableBottomPasses++;
      } else {
        stableBottomPasses = 0;
      }
      previousHeight = state.height;
      await new Promise(resolve => setTimeout(resolve, 250));
    }

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
        .filter(link => link.text || link.url),
      images: [...new Map(
        [...document.querySelectorAll("img")]
          .map(image => {
            const rawSrc = image.getAttribute("data-src")
              || image.getAttribute("data-original")
              || image.getAttribute("data-lazy-src")
              || image.getAttribute("data-url")
              || image.currentSrc
              || image.getAttribute("src")
              || "";
            let src = "";
            try {
              const parsedSrc = new URL(rawSrc, document.baseURI);
              if (parsedSrc.protocol === "http:" || parsedSrc.protocol === "https:") {
                src = parsedSrc.href;
              }
            } catch {
              // Ignore invalid or empty image URLs.
            }
            return [src, { src, alt: image.alt.trim() }];
          })
          .filter(([src]) => src)
      ).values()]
    }));
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeUrl };