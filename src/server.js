// Node.js Example using Express and Puppeteer
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/scrape', async (req, res) => {
    try {
        const result =  await handleReq(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).send('Server error');
    }
});

const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.timeout = 5000; // Server timeout in milliseconds

async function handleReq(data) {
    const { postcode, houseNo, streetName } = data;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(postcode)}`, { waitUntil: 'networkidle0' });

    const addresses = await page.evaluate(() => {
        const items = document.querySelectorAll('.govuk-link');
        return Array.from(items).map(item => ({ title: item.innerText.trim(), link: item.href }));
    });

    const specificAddress = addresses.find(a => {
        return a.title.includes(houseNo) && a.title.toLowerCase().includes(streetName.toLowerCase());
      });

    let floorAreaDetails = {};
    if (specificAddress) {
        await page.goto(specificAddress.link, { waitUntil: 'networkidle0' });
        floorAreaDetails = await page.evaluate(() => {
            // Get required details using the correct selector
            return {
                detail: document.querySelectorAll('.govuk-summary-list__value')[1].innerText
            };
        });
    }
    
    await browser.close();
    
    return floorAreaDetails || { error: 'Address not found' };
}