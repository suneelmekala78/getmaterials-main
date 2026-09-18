import { chromium } from "playwright";

const TARGET = process.argv[2] || "http://localhost:3000/dev/ga-signup-test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const hits = [];

page.on("request", (req) => {
  const url = req.url();
  if (url.includes("/g/collect") || url.includes("/j/collect")) hits.push(url);
});

page.on("console", (msg) => {
  if (msg.text().includes("[GA4]")) console.log("browser:", msg.text());
});

console.log("Navigating", TARGET);
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => ({
  gtag: typeof window.gtag,
  ids: [...new Set(document.documentElement.innerHTML.match(/G-[A-Z0-9]+/g) || [])],
}));
console.log("probe", probe);

const before = hits.length;
await page.click("#fire-signup");
await page.waitForSelector("#status:has-text('resolved')", { timeout: 10000 });
await page.waitForTimeout(1000);

const after = hits.slice(before);
const signUp = after.filter((u) => u.includes("en=sign_up"));
const withMethod = signUp.filter((u) => u.includes("ep.method=email"));

console.log("new collects", after.length);
console.log("sign_up", signUp.length, "with method", withMethod.length);
if (signUp[0]) console.log(signUp[0].slice(0, 400));

const pass = signUp.length > 0 && withMethod.length > 0;
console.log(pass ? "\nPASS: g/collect sign_up + ep.method=email sent" : "\nFAIL");
await browser.close();
process.exit(pass ? 0 : 1);
