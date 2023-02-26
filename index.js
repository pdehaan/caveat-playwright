import fs from "node:fs/promises";
import { chromium } from 'playwright';

const EVENTS_URL = "https://caveat.nyc/events?livestream=true&tag=Improv";
const EVENT_LOCATOR = "a.MuiCardActionArea-root";

const events = await caveatEvents(EVENTS_URL);
await fs.writeFile("./caveat.json", JSON.stringify(events, null, 2));

async function caveatEvents(eventsUrl = EVENTS_URL) {
  const events = new Set();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(eventsUrl);
  const eventLinks = await page.locator(EVENT_LOCATOR).all();
  
  for (const event of eventLinks) {
    try {
      let eventHref = await event.getAttribute("href");
      eventHref = new URL(eventHref, eventsUrl).href;
      const _page = await browser.newPage();
      await _page.goto(eventHref);
      const ldJson = await _page.locator("script[type='application/ld+json']").textContent();
      events.add(JSON.parse(ldJson));
    } catch (err) {
      console.error(`  ${err.message}`);
    }
  }
  await browser.close();
  return [...events];
}
