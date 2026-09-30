const express = require("express");
const path = require("path");
const { scrapeUrl } = require("./scrape");
const app = express();

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/scrape", async (req, res) => {
  if (typeof req.query.url !== "string") {
    return res.status(400).json({ error: "Enter a URL to scrape." });
  }

  let target;
  try {
    target = new URL(req.query.url);
  } catch {
    return res.status(400).json({ error: "Enter a valid URL." });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return res.status(400).json({ error: "Only http and https URLs are supported." });
  }

  try {
    res.json(await scrapeUrl(target.href));
  } catch (error) {
    res.status(502).json({ error: `Could not scrape this page: ${error.message}` });
  }
});

app.listen(3000, () => {
  console.log("Server started: http://localhost:3000");
});