const puppeteer = require('puppeteer');

/**
 * Scrapes Google Maps for businesses matching the query.
 * @param {string} query
 * @param {number} maxResults
 * @param {function} onProgress - called with (current, total, name) as each business is extracted
 */
async function scrapeGoogleMaps(query, maxResults = 60, onProgress = null) {
  console.log(`[Scraper] Starting scrape for: "${query}"`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const results = [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/maps/search/${encodedQuery}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for results panel
    await page.waitForSelector('[role="feed"]', { timeout: 15000 }).catch(() => {
      console.log('[Scraper] Feed selector not found, trying alternative...');
    });

    // Scroll to load more results
    await autoScroll(page, maxResults);

    // Extract all listing links
    const listingLinks = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href*="/maps/place/"]');
      const hrefs = new Set();
      anchors.forEach((a) => {
        const href = a.href;
        if (href && href.includes('/maps/place/')) {
          hrefs.add(href);
        }
      });
      return Array.from(hrefs).slice(0, 80);
    });

    console.log(`[Scraper] Found ${listingLinks.length} listing links`);

    // Visit each listing and extract details
    const toVisit = listingLinks.slice(0, maxResults);

    for (let i = 0; i < toVisit.length; i++) {
      const link = toVisit[i];
      try {
        const business = await extractBusinessDetails(page, link);
        if (business && business.name) {
          results.push(business);
          console.log(`[Scraper] (${i + 1}/${toVisit.length}) Extracted: ${business.name}`);
          if (onProgress) onProgress(i + 1, toVisit.length, business.name);
        } else {
          if (onProgress) onProgress(i + 1, toVisit.length, null);
        }
      } catch (err) {
        console.log(`[Scraper] Failed to extract from ${link}: ${err.message}`);
        if (onProgress) onProgress(i + 1, toVisit.length, null);
      }

      // Small delay to be polite
      await delay(800 + Math.random() * 500);
    }
  } catch (err) {
    console.error('[Scraper] Error:', err.message);
  } finally {
    await browser.close();
  }

  console.log(`[Scraper] Done. Collected ${results.length} businesses.`);
  return results;
}

async function extractBusinessDetails(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(1500);

  return await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    };

    const getAttr = (selector, attr) => {
      const el = document.querySelector(selector);
      return el ? el.getAttribute(attr) : null;
    };

    // Business name
    const name =
      getText('h1.DUwDvf') ||
      getText('h1[class*="fontHeadlineLarge"]') ||
      getText('h1') ||
      null;

    // Category
    const category =
      getText('button[jsaction*="category"]') ||
      getText('.DkEaL') ||
      getText('[class*="fontBodyMedium"] button') ||
      null;

    // Rating
    const ratingText =
      getText('div.F7nice span[aria-hidden="true"]') ||
      getText('span.ceNzKf') ||
      null;
    const rating = ratingText ? parseFloat(ratingText) : null;

    // Review count
    const reviewText =
      getText('div.F7nice span[aria-label*="review"]') ||
      getText('button[jsaction*="review"] span') ||
      null;
    const reviewMatch = reviewText ? reviewText.replace(/,/g, '').match(/\d+/) : null;
    const reviewCount = reviewMatch ? parseInt(reviewMatch[0]) : 0;

    // Phone
    const phoneEl = document.querySelector('button[data-item-id*="phone"]');
    const phone = phoneEl
      ? phoneEl.getAttribute('data-item-id')?.replace('phone:tel:', '') ||
        phoneEl.textContent.trim()
      : null;

    // Address
    const addressEl = document.querySelector('button[data-item-id="address"]');
    const address = addressEl ? addressEl.textContent.trim() : null;

    // Website
    const websiteEl = document.querySelector('a[data-item-id="authority"]');
    const website = websiteEl ? websiteEl.href : null;
    const hasWebsite = !!website;

    // Google Maps URL (current page)
    const mapsUrl = window.location.href;

    return {
      name,
      category,
      rating,
      reviewCount,
      phone,
      address,
      website,
      hasWebsite,
      mapsUrl,
    };
  });
}

async function autoScroll(page, targetCount) {
  // Scroll the results panel to load more listings
  await page.evaluate(async (target) => {
    const feed = document.querySelector('[role="feed"]');
    if (!feed) return;

    let lastCount = 0;
    let stableRounds = 0;

    while (stableRounds < 3) {
      feed.scrollTop = feed.scrollHeight;
      await new Promise((r) => setTimeout(r, 1500));

      const current = feed.querySelectorAll('a[href*="/maps/place/"]').length;
      if (current >= target) break;
      if (current === lastCount) {
        stableRounds++;
      } else {
        stableRounds = 0;
        lastCount = current;
      }
    }
  }, targetCount);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { scrapeGoogleMaps };
