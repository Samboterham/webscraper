const assert = require("node:assert/strict");
const { scrapeUrl } = require("./scrape");

(async () => {
  const result = await scrapeUrl("https://example.com");
  assert.equal(result.title, "Example Domain");
  assert.equal(typeof result.heading, "string");
  assert.ok(Array.isArray(result.paragraphs));
  assert.ok(Array.isArray(result.links));
  console.log("Scraper test passed.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});