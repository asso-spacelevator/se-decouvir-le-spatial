const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await btn.textContent();
    if (text && text.includes('Commencer la partie 1')) { await btn.click(); break; }
  }
  await page.waitForTimeout(300);
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const text = await btn.textContent();
    if (text && text.includes('Citations')) { await btn.click(); break; }
  }
  await page.waitForTimeout(300);

  // Armstrong correct, others wrong (scrambled)
  const mixedAnswers = ['Neil Armstrong', 'Carl Sagan', 'Stephen Hawking', 'Konstantin Tsiolkovsky'];
  const selects = await page.$$('select');
  for (let i = 0; i < selects.length; i++) {
    await selects[i].selectOption(mixedAnswers[i]);
    await page.waitForTimeout(100);
  }

  const verifyBtn = await page.$('button:has-text("Vérifier")');
  await verifyBtn?.click();
  await page.waitForTimeout(500);

  // Scroll to see Armstrong card
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.screenshot({ path: '/tmp/12_armstrong_correct_others_wrong.png' });
  console.log('Screenshot taken');

  // Check border colors
  const cards = await page.$$eval('[class*="rounded-2xl overflow-hidden"]', cards =>
    cards.map(c => ({
      border: c.className.match(/border-[^\s]*/g)?.join(' ') || '',
      text: c.querySelector('p')?.textContent?.slice(0, 40) || '',
      selectVal: c.querySelector('select')?.value || ''
    }))
  );
  console.log('Cards state:', JSON.stringify(cards, null, 2));

  await browser.close();
})();
